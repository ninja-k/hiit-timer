// Dawn Chorus Audio Engine
export class DawnChorusAudio {
    constructor() {
        // Audio nodes
        this.padSynth = null;
        this.chimeSynth = null;
        this.birdSynth = null;
        this.noise = null;
        this.analyser = null;
        
        // Effects
        this.reverb = null;
        this.delay = null;
        this.chorus = null;
        
        // Mixer
        this.mixer = null;
        
        // State
        this.isPlaying = false;
        this.startTime = 0;
        this.chimeLoop = null;
        this.birdLoop = null;
        
        // Do not automatically initialize to prevent autoplay
        // The init() method will be called explicitly by the controller
    }
    
    async init() {
        try {
            // Initialize Tone.js if not already started
            if (Tone.context.state !== 'running') {
                console.log('Starting audio context...');
                try {
                    await Tone.start();
                    await Tone.loaded();
                    console.log('Audio context started successfully');
                } catch (error) {
                    console.error('Failed to start audio context:', error);
                    throw error;
                }
            }
            
            // Create effects with more natural settings
            this.reverb = new Tone.Reverb({
                decay: 5.5,
                wet: 0.4,
                preDelay: 0.1
            }).toDestination();
            
            this.delay = new Tone.FeedbackDelay({
                delayTime: 0.4,
                feedback: 0.3,
                wet: 0.15
            }).connect(this.reverb);
            
            this.chorus = new Tone.Chorus({
                frequency: 1.2,
                delayTime: 2.5,
                depth: 0.5,
                spread: 120,
                wet: 0.2
            }).connect(this.delay);
            
            // Create mixer with better gain staging
            this.mixer = new Tone.Volume(-8).toDestination();
            
            // Create smoother pad synth
            this.padSynth = new Tone.PolySynth(Tone.Synth, {
                envelope: {
                    attack: 4,
                    decay: 2,
                    sustain: 0.6,
                    release: 6
                },
                oscillator: {
                    type: 'sine',
                    modulationType: 'sine',
                    modulationIndex: 1.5,
                    harmonicity: 0.4
                },
                volume: -12
            }).connect(this.chorus);
            
            // Create more natural chime synth
            this.chimeSynth = new Tone.MetalSynth({
                frequency: 1200,
                envelope: {
                    attack: 0.005,
                    decay: 1.2,
                    release: 1.5
                },
                harmonicity: 8,
                modulationIndex: 15,
                resonance: 800,
                octaves: 2,
                volume: -10
            }).connect(this.reverb);
            
            // Create more realistic bird synth
            this.birdSynth = new Tone.MonoSynth({
                oscillator: {
                    type: 'triangle',
                    modulationType: 'sine',
                    modulationIndex: 2
                },
                envelope: {
                    attack: 0.02,
                    decay: 0.3,
                    sustain: 0.1,
                    release: 0.2
                },
                volume: -6
            }).connect(this.reverb);
            
            // Create wind noise with better filtering
            this.noise = new Tone.Noise('pink').start();
            this.noiseFilter = new Tone.Filter({
                type: 'bandpass',
                frequency: 500,
                Q: 0.5,
                gain: 2
            }).connect(this.reverb);
            this.noise.volume.value = -20;
            this.noise.connect(this.noiseFilter);
            
            // Create analyser for visualization
            this.analyser = new Tone.Analyser('waveform', 512);
            this.mixer.connect(this.analyser);
            
            // Initialize sequences
            this.initPadSequence();
            this.initChimeSequence();
            this.initBirdSequence();
            
            console.log('Audio engine initialized with enhanced settings');
        } catch (error) {
            console.error('Error initializing audio engine:', error);
        }
    }
    
    initPadSequence() {
        // More organic chord progression with added 7ths and 9ths
        const chords = [
            ["C3", "E3", "G3", "B3", "D4"],  // Cmaj9
            ["G2", "B2", "D3", "F#3", "A3"],  // Gmaj9
            ["A2", "C#3", "E3", "G3", "B3"], // A9
            ["F#2", "A2", "C#3", "E3", "G#3"] // F#m9
        ];
        
        let chordIndex = 0;
        
        // Change chord every 8 bars (16 seconds at 120bpm)
        setInterval(() => {
            if (!this.isPlaying) return;
            
            const now = Tone.now();
            const chord = chords[chordIndex];
            
            // Play chord with more organic timing and voicing
            chord.forEach((note, i) => {
                // Randomize timing slightly for natural feel
                const timeOffset = (Math.random() * 0.05);
                // Randomize velocity for dynamic expression
                const velocity = 0.5 + (Math.random() * 0.3);
                
                this.padSynth.triggerAttackRelease(
                    note,
                    "1m", // Let notes ring out
                    now + timeOffset,
                    velocity
                );
                
                // Add subtle pitch bend for warmth
                if (Math.random() > 0.7) {
                    this.padSynth.set({
                        detune: (Math.random() * 10) - 5 // Slight detune
                    });
                }
            });
            
            // Move to next chord
            chordIndex = (chordIndex + 1) % chords.length;
            
        }, 16000);
    }
    
    initChimeSequence() {
        // More natural chime patterns with pentatonic scale
        const scales = {
            major: ["C5", "D5", "E5", "G5", "A5", "C6"],
            minor: ["A4", "C5", "D5", "E5", "G5", "A5"]
        };
        
        let lastNote = null;
        let scale = scales.major;
        
        this.chimeLoop = new Tone.Loop(time => {
            if (!this.isPlaying) return;
            
            // Occasionally switch between major and minor
            if (Math.random() > 0.95) {
                scale = Math.random() > 0.5 ? scales.major : scales.minor;
            }
            
            // Weighted random for more musical results
            let noteIndex;
            if (lastNote) {
                const currentIndex = scale.indexOf(lastNote);
                // Prefer notes close to the last one for smoother melodies
                const offset = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                noteIndex = Math.max(0, Math.min(scale.length - 1, currentIndex + offset));
            } else {
                noteIndex = Math.floor(Math.random() * scale.length);
            }
            
            const note = scale[noteIndex];
            lastNote = note;
            
            // Add some randomness to timing and velocity
            const velocity = 0.4 + (Math.random() * 0.3);
            const duration = Math.random() > 0.8 ? "8n" : "16n";
            
            this.chimeSynth.triggerAttackRelease(note, duration, time, velocity);
            
            // Occasionally add a second chime for harmony
            if (Math.random() > 0.7) {
                const harmonyNote = scale[Math.min(scale.length - 1, noteIndex + 2)];
                this.chimeSynth.triggerAttackRelease(
                    harmonyNote,
                    duration,
                    time + 0.05,
                    velocity * 0.7
                );
            }
            
        }, ["0:0:0", "0:0:2", "0:1:1", "0:2:0", "0:3:1"]); // More musical timing pattern
    }
    
    initBirdSequence() {
        // More natural bird call patterns with varied intervals
        const birdCalls = {
            // Different bird species patterns
            sparrow: [
                { notes: ["C6", "G5"], rhythm: [0, 0.2] },
                { notes: ["A5", "E5"], rhythm: [0, 0.15] },
                { notes: ["G5", "D5"], rhythm: [0, 0.25] }
            ],
            robin: [
                { notes: ["E5", "G5", "E5"], rhythm: [0, 0.1, 0.3] },
                { notes: ["F#5", "A5", "F#5"], rhythm: [0, 0.12, 0.28] }
            ],
            finch: [
                { notes: ["G5", "B5", "D6"], rhythm: [0, 0.08, 0.2] },
                { notes: ["A5", "C#6", "E6"], rhythm: [0, 0.1, 0.22] }
            ]
        };
        
        let lastCallTime = 0;
        
        this.birdLoop = new Tone.Loop(time => {
            if (!this.isPlaying) return;
            
            const now = Tone.Transport.seconds;
            // Ensure birds don't call too frequently
            if (now - lastCallTime < 2.0) return;
            
            // Random chance to play a bird call (lower for more natural spacing)
            if (Math.random() > 0.6) {
                // Choose a random bird type
                const birdTypes = Object.keys(birdCalls);
                const birdType = birdTypes[Math.floor(Math.random() * birdTypes.length)];
                const calls = birdCalls[birdType];
                const call = calls[Math.floor(Math.random() * calls.length)];
                
                // Play the bird call with natural timing
                call.notes.forEach((note, i) => {
                    const noteTime = time + (call.rhythm[i] || 0);
                    // Add slight randomness to timing
                    const jitter = (Math.random() * 0.05) - 0.025;
                    
                    // Vary the velocity for more realism
                    const velocity = 0.2 + (Math.random() * 0.3);
                    
                    this.birdSynth.triggerAttackRelease(
                        note,
                        "32n",
                        noteTime + jitter,
                        velocity
                    );
                });
                
                lastCallTime = now;
                
                // Occasionally add a response from another bird
                if (Math.random() > 0.7) {
                    const responseDelay = 0.5 + (Math.random() * 1.5);
                    setTimeout(() => {
                        if (!this.isPlaying) return;
                        const responseBird = birdTypes[Math.floor(Math.random() * birdTypes.length)];
                        const responseCalls = birdCalls[responseBird];
                        const responseCall = responseCalls[Math.floor(Math.random() * responseCalls.length)];
                        
                        responseCall.notes.forEach((note, i) => {
                            const noteTime = Tone.Transport.seconds + (responseCall.rhythm[i] || 0);
                            this.birdSynth.triggerAttackRelease(
                                note,
                                "32n",
                                noteTime,
                                0.2 + (Math.random() * 0.3)
                            );
                        });
                    }, responseDelay * 1000);
                }
            }
            
        }, ["0:0:0", "0:1:1", "0:2:2", "0:3:1", "1:0:0", "1:2:2"]); // More natural timing pattern
    }
    
    async start() {
        if (this.isPlaying) return;
        
        try {
            console.log('Starting audio playback...');
            
            // Ensure audio context is running
            if (Tone.context.state !== 'running') {
                console.log('Audio context not running, starting...');
                await Tone.start();
                await Tone.loaded();
            }
            
            // Check if we need to reinitialize the audio engine
            if (!this.padSynth || !this.chimeSynth || !this.birdSynth) {
                console.log('Reinitializing audio engine...');
                await this.init();
            }
            
            this.isPlaying = true;
            this.startTime = Date.now();
            
            // Ensure loops are initialized
            if (!this.chimeLoop || !this.birdLoop) {
                this.initChimeSequence();
                this.initBirdSequence();
            }
            
            // Start loops
            console.log('Starting transport and loops...');
            Tone.Transport.start();
            
            if (this.chimeLoop) this.chimeLoop.start(0);
            if (this.birdLoop) this.birdLoop.start(0);
            
            // Fade in noise (wind)
            if (this.noise) {
                this.noise.volume.rampTo(-30, 5);
            }
            
            console.log('Audio playback started');
            return Promise.resolve();
        } catch (error) {
            console.error('Error starting audio:', error);
            this.isPlaying = false;
            throw error;
        }
    }
    
    stop() {
        if (!this.isPlaying) return;
        
        console.log('Stopping Dawn Chorus audio...');
        this.isPlaying = false;
        
        // Immediately stop the transport and loops
        if (this.chimeLoop) this.chimeLoop.stop();
        if (this.birdLoop) this.birdLoop.stop();
        
        // Stop the Tone.Transport
        Tone.Transport.stop();
        Tone.Transport.cancel(); // Cancel all scheduled events
        
        try {
            // Completely disconnect all synths from the audio graph
            if (this.padSynth) {
                if (typeof this.padSynth.releaseAll === 'function') {
                    this.padSynth.releaseAll();
                }
                if (this.padSynth.volume) this.padSynth.volume.value = -Infinity;
                this.padSynth.disconnect();
            }
            
            if (this.chimeSynth) {
                if (this.chimeSynth.volume) this.chimeSynth.volume.value = -Infinity;
                this.chimeSynth.disconnect();
            }
            
            if (this.birdSynth) {
                if (typeof this.birdSynth.releaseAll === 'function') {
                    this.birdSynth.releaseAll();
                } else if (typeof this.birdSynth.triggerRelease === 'function') {
                    this.birdSynth.triggerRelease();
                }
                if (this.birdSynth.volume) this.birdSynth.volume.value = -Infinity;
                this.birdSynth.disconnect();
            }
            
            // Stop and disconnect noise
            if (this.noise) {
                if (this.noise.volume) this.noise.volume.value = -Infinity;
                this.noise.stop();
                this.noise.disconnect();
            }
            
            // Disconnect effects
            if (this.reverb) this.reverb.disconnect();
            if (this.delay) this.delay.disconnect();
            if (this.chorus) this.chorus.disconnect();
            if (this.mixer) this.mixer.disconnect();
            if (this.noiseFilter) this.noiseFilter.disconnect();
            
            // Dispose of analyzer if it exists
            if (this.analyser) this.analyser.dispose();
            
            // Recreate synths on next start
            this.padSynth = null;
            this.chimeSynth = null;
            this.birdSynth = null;
            this.noise = null;
            
        } catch (e) {
            console.warn('Error disconnecting audio nodes:', e);
        }
        
        console.log('Dawn Chorus audio stopped and disconnected');
    }
    
    updateControls(params) {
        try {
            // Handle both object and individual parameters
            let pads, chimes, birds;
            
            if (typeof params === 'object' && params !== null) {
                // Object parameter format
                pads = params.pads !== undefined ? params.pads : 0;
                chimes = params.chimes !== undefined ? params.chimes : 0;
                birds = params.birds !== undefined ? params.birds : 0;
            } else {
                // Individual parameters (for backward compatibility)
                pads = arguments[0];
                chimes = arguments[1];
                birds = arguments[2];
            }
            
            // Ensure we have valid numbers, default to 0 if invalid
            const safePads = typeof pads === 'number' && !isNaN(pads) ? Math.max(0, Math.min(1, pads)) : 0;
            const safeChimes = typeof chimes === 'number' && !isNaN(chimes) ? Math.max(0, Math.min(1, chimes)) : 0;
            const safeBirds = typeof birds === 'number' && !isNaN(birds) ? Math.max(0, Math.min(1, birds)) : 0;
            
            console.log('Updating controls:', { pads: safePads, chimes: safeChimes, birds: safeBirds });
            
            // Update pad volume if padSynth exists
            if (this.padSynth && this.padSynth.volume) {
                const padDb = Tone.gainToDb(safePads * 0.8);
                this.padSynth.volume.rampTo(padDb, 0.5);
            }
            
            // Update chime volume if chimeSynth exists (reduced volume for better balance)
            if (this.chimeSynth && this.chimeSynth.volume) {
                const chimeDb = Tone.gainToDb(safeChimes * 0.5);
                this.chimeSynth.volume.rampTo(chimeDb, 0.3);
            }
            
            // Update bird volume if birdSynth exists
            if (this.birdSynth && this.birdSynth.volume) {
                const birdDb = Tone.gainToDb(safeBirds * 0.5);
                this.birdSynth.volume.rampTo(birdDb, 0.5);
            }
            
            // Update wind noise if noise exists
            if (this.noise && this.noise.volume) {
                const noiseLevel = (safePads * 0.3) - 0.3;
                const dbLevel = Math.max(-60, Tone.gainToDb(Math.max(0, noiseLevel)));
                this.noise.volume.rampTo(dbLevel, 2);
            }
        } catch (error) {
            console.error('Error updating controls:', error);
            // Ensure we don't crash the application on error
            if (this.padSynth?.volume) this.padSynth.volume.rampTo(-Infinity, 1);
            if (this.chimeSynth?.volume) this.chimeSynth.volume.rampTo(-Infinity, 1);
            if (this.birdSynth?.volume) this.birdSynth.volume.rampTo(-Infinity, 1);
            if (this.noise?.volume) this.noise.volume.rampTo(-Infinity, 1);
        }
    }
    
    getAnalyser() {
        return this.analyser;
    }
    
    getProgress() {
        if (!this.isPlaying) return 0;
        const elapsed = (Date.now() - this.startTime) / 1000; // in seconds
        const totalDuration = 1800; // 30 minutes in seconds
        return Math.min(elapsed / totalDuration, 1);
    }
}
