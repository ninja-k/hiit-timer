import { stylePresets } from './workout-music-presets.js';

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.instruments = {};
        this.effects = {};
        this.masterCompressor = null;
        this.sidechainCompressor = null;
        this.sidechainGain = null;
        this.initialized = false;
        this.audioBufferPool = {
            oscillators: [],
            gainNodes: [],
            maxPoolSize: 10
        };
    }

    async initialize() {
        try {
            console.log('Creating AudioContext...');
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('AudioContext created, state:', this.audioContext.state);

            if (this.audioContext.state === 'suspended') {
                console.log('AudioContext is suspended, attempting to resume...');
                await this.audioContext.resume();
                console.log('AudioContext resumed, new state:', this.audioContext.state);
            }

            this.initialized = true;
            console.log('AudioManager initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing audio:');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);

            if (error.name === 'NotAllowedError') {
                console.error('AudioContext creation was not allowed. This is usually due to browser autoplay policies.');
                console.error('User interaction is required before audio can be played.');
            } else if (error.name === 'NotSupportedError') {
                console.error('Web Audio API is not supported in this browser or context.');
            }

            this.initialized = false;
            return false;
        }
    }

    createInstruments() {
        // Create a master volume control
        this.masterVolume = new Tone.Volume(0).toDestination();
        
        // Create instruments with proper connections
        this.instruments = {
            kick: new Tone.MembraneSynth({
                pitchDecay: 0.05,
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.001,
                    decay: 0.4,
                    sustain: 0.01,
                    release: 0.1,
                    attackCurve: 'exponential'
                },
                volume: 0  // Set to 0 since we'll control volume with pattern values
            }).connect(this.masterVolume),

            snare: new Tone.NoiseSynth({
                noise: { type: 'white' },
                envelope: {
                    attack: 0.001,
                    decay: 0.2,
                    sustain: 0.01,
                    release: 0.1
                },
                volume: -5  // Less reduction for better response
            }).connect(this.masterVolume),

            hihat: new Tone.MetalSynth({
                frequency: 200,
                envelope: {
                    attack: 0.001,
                    decay: 0.1,
                    release: 0.1
                },
                harmonicity: 5.1,
                modulationIndex: 32,
                resonance: 4000,
                octaves: 1.5,
                volume: -10  // Less reduction for better response
            }).connect(this.masterVolume),

            bass: new Tone.MonoSynth({
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.01,
                    decay: 0.3,
                    sustain: 0.5,
                    release: 0.5
                },
                volume: 0  // Set to 0 since we'll control volume with pattern values
            }).toDestination()
        };

        console.log('Instruments created:', Object.keys(this.instruments));
    }


    getPooledOscillator() {
        if (this.audioBufferPool.oscillators.length > 0) {
            return this.audioBufferPool.oscillators.pop();
        }
        return new Tone.Oscillator({
            type: 'sine',
            volume: -20
        });
    }

    returnOscillatorToPool(oscillator) {
        if (this.audioBufferPool.oscillators.length < this.audioBufferPool.maxPoolSize) {
            oscillator.stop();
            this.audioBufferPool.oscillators.push(oscillator);
        } else {
            oscillator.dispose();
        }
    }

    playBassSlide(slide) {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';

        const startFreq = this.noteToFrequency(slide.from);
        const endFreq = this.noteToFrequency(slide.to);

        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + slide.duration);
        oscillator.connect(this.audioContext.destination);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + slide.duration);
    }

    noteToFrequency(note) {
        const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
        const baseFrequency = 440; // A4
        const baseOctave = 4;
        const noteName = note.slice(0, -1);
        const octave = parseInt(note.slice(-1));
        const noteIndex = notes.indexOf(noteName);
        const noteInOctave = noteIndex - 9;
        return baseFrequency * Math.pow(2, (noteInOctave + (octave - baseOctave) * 12) / 12);
    }

    /**
     * Update the BPM (beats per minute) for all scheduled events
     * @param {number} bpm - The new BPM value
     */
    setBPM(bpm) {
        console.log(`Setting BPM to ${bpm}`);
        if (this.initialized) {
            // Update Tone.js transport BPM with a ramp for smoother transitions
            if (window.Tone && Tone.Transport) {
                // Don't cancel existing playback, just update the BPM
                // Ramp to new BPM over a short time to avoid clicks
                Tone.Transport.bpm.rampTo(bpm, 0.1);
                console.log(`BPM set to ${bpm}`);
                
                // If we're currently playing, make sure the loop continues
                if (this.currentLoop && Tone.Transport.state === 'started') {
                    console.log('Maintaining playback during BPM change');
                }
            } else {
                console.warn('Tone.js not available for BPM change');
            }
        } else {
            console.warn('AudioManager not initialized');
        }
    }

    // Start playback of the pattern
    startPlayback(pattern, bpm, onStep) {
        // Store the current pattern and BPM
        this.currentPattern = pattern;
        this.currentBPM = bpm;
        
        // Set initial BPM with a ramp for smooth start
        if (Tone.Transport.state !== 'started') {
            // Only stop if not already playing
            this.stopPlayback();
            Tone.Transport.bpm.value = bpm;
        } else {
            // If already playing, just update BPM
            Tone.Transport.bpm.rampTo(bpm, 0.1);
            return; // Don't re-schedule events if already playing
        }

        // Schedule the pattern
        let step = 0;
        const loop = new Tone.Loop((time) => {
            const currentStep = step % pattern.length;
            onStep(currentStep);

            // Play instruments based on pattern
            pattern[currentStep].forEach((value, i) => {
                const instrumentName = ['kick', 'snare', 'hihat', 'bass'][i];
                if (value > 0 && this.instruments[instrumentName]) {
                    if (instrumentName === 'bass') {
                        this.instruments[instrumentName].triggerAttackRelease('C2', '8n', time, value);
                    } else {
                        this.instruments[instrumentName].triggerAttackRelease('8n', time, value);
                    }
                }
            });

            step++;
        }, '8n');

        // Store the loop so we can stop it later
        this.currentLoop = loop;

        // Start playback
        Tone.Transport.start();
        loop.start(0);
    }

    // Stop playback
    stopPlayback() {
        if (this.currentLoop) {
            this.currentLoop.stop();
            this.currentLoop.dispose();
            this.currentLoop = null;
        }
        Tone.Transport.stop();
        Tone.Transport.cancel();
    }
}
