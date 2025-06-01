// Instruments for Workout Music Generator
class Instruments {
    constructor() {
        console.log('[Instruments] Initializing...');
        
        // Create master volume control with better default settings
        this.masterVolume = new Tone.Volume(0).toDestination(); // Start at 0dB for better audibility
        this.masterVolume.volume.value = 0; // 0dB for better audibility
        
        this.instruments = {
            kick: null,
            snare: null,
            hihat: null,
            bass: null,
            lead: null,
            pad: null
        };
        
        this.initialized = false;
        
        // Ensure we have a reference to the audio context
        if (!Tone.context.state || Tone.context.state !== 'running') {
            console.log('[Instruments] Audio context not running, will start on user interaction');
        }
        
        console.log('[Instruments] Initialization complete');
    }
    
    async init() {
        if (this.initialized) return;
        
        // Create drum synthesizers
        this.instruments.kick = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 5,
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.001,
                decay: 0.2,
                sustain: 0.01,
                release: 0.2,
                attackCurve: 'exponential'
            }
        }).connect(this.masterVolume);
        this.instruments.kick.volume.value = -2; // Increased volume

        this.instruments.snare = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: {
                attack: 0.001,
                decay: 0.2,
                sustain: 0.01,
                release: 0.2
            }
        }).connect(this.masterVolume);
        this.instruments.snare.volume.value = -4; // Increased volume

        this.instruments.hihat = new Tone.MetalSynth({
            frequency: 200,
            envelope: {
                attack: 0.001,
                decay: 0.1,
                release: 0.1
            },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        }).connect(this.masterVolume);
        this.instruments.hihat.volume.value = -8; // Increased volume

        // Create bass synth
        this.instruments.bass = new Tone.MonoSynth({
            oscillator: {
                type: 'sawtooth',
                count: 3,
                spread: 30
            },
            envelope: {
                attack: 0.01,
                decay: 0.3,
                sustain: 0.5,
                release: 0.5
            },
            filterEnvelope: {
                attack: 0.001,
                decay: 0.1,
                sustain: 0.5,
                release: 0.5,
                baseFrequency: 200,
                octaves: 3
            }
        }).connect(this.masterVolume);
        this.instruments.bass.volume.value = -3; // Increased volume

        // Create lead synth
        this.leadActiveNotes = new Set();
        this.leadVoiceCount = 0;
        this.maxLeadVoices = 8;
        
        this.instruments.lead = new Tone.PolySynth({
            maxPolyphony: 8,
            voice: Tone.Synth,
            options: {
                oscillator: {
                    type: 'sawtooth',
                    partials: [1, 2, 3]
                },
                envelope: {
                    attack: 0.1,
                    decay: 0.3,
                    sustain: 0.5,
                    release: 0.5
                }
            }
        });
        
        // Add effects to lead
        const leadDelay = new Tone.PingPongDelay({
            delayTime: '8n',
            feedback: 0.3,
            wet: 0.2
        });
        
        const leadChorus = new Tone.Chorus(4, 2.5, 0.5).start();
        
        // Connect lead through effects to master volume
        this.instruments.lead.chain(leadDelay, leadChorus, this.masterVolume);
        this.instruments.lead.volume.value = -4; // Increased volume
        
        // Create pad synth
        this.padActiveNotes = new Set();
        this.padVoiceCount = 0;
        this.maxPadVoices = 8;
        
        this.instruments.pad = new Tone.PolySynth({
            maxPolyphony: 8,
            voice: Tone.Synth,
            options: {
                oscillator: {
                    type: 'sawtooth',
                    partials: [1, 2]
                },
                envelope: {
                    attack: 0.1,
                    decay: 0.3,
                    sustain: 0.5,
                    release: 2.0
                }
            }
        });
        
        // Add reverb to pad
        const reverb = new Tone.Reverb({
            decay: 2,
            wet: 0.5
        });
        
        // Connect pad through reverb to master volume
        this.instruments.pad.chain(reverb, this.masterVolume);
        this.instruments.pad.volume.value = -2; // Increased volume
        
        // Log when pad is being used
        console.log('Pad synth created and connected:', this.instruments.pad);
        
        // Test the instruments when audio context is running
        const testInstruments = () => {
            if (Tone.context.state !== 'running') {
                console.log('Audio context not ready for test, will try again...');
                setTimeout(testInstruments, 500);
                return;
            }
            
            console.log('Audio context is running, playing test sequence...');
            
            try {
                // Simple test sequence
                const now = Tone.now();
            
                // Test each instrument with proper note tracking
                this.instruments.kick.triggerAttackRelease('C2', '8n', now);
                this.instruments.snare.triggerAttackRelease('8n', now + 0.25);
                this.instruments.hihat.triggerAttackRelease('C6', '16n', now + 0.5);
                this.instruments.bass.triggerAttackRelease('C2', '8n', now + 0.75);
                this.instruments.lead.triggerAttackRelease('C4', '8n', now + 1.0);
                this.instruments.pad.triggerAttackRelease('C4', '2n', now + 1.5);
                
                console.log('Test sequence completed successfully');
            } catch (error) {
                console.error('Error during test sequence:', error);
            }
        };
        
        // Connect any instruments that might not be connected
        Object.values(this.instruments).forEach(instrument => {
            if (instrument && !instrument.connected) {
                instrument.connect(this.masterVolume);
            }
        });

        // Add a global compressor to glue everything together
        this.compressor = new Tone.Compressor({
            threshold: -20,
            ratio: 4,
            attack: 0.1,
            release: 0.1
        }).toDestination();

        // Route all instruments through the compressor
        Tone.Destination.chain(this.compressor);

        // Start the test after everything is set up
        testInstruments();

        this.initialized = true;
        console.log('All instruments initialized');
    }

    // Handle note on/off for the lead
    noteOn(note, velocity = 1) {
        if (!this.initialized) return;
        
        this.leadActiveNotes.add(note);
        this.leadVoiceCount++;
        this.checkLeadPolyphony();
        
        this.instruments.lead.triggerAttack(note, undefined, velocity);
    }
    
    noteOff(note) {
        if (!this.initialized) return;
        
        this.leadActiveNotes.delete(note);
        this.leadVoiceCount = Math.max(0, this.leadVoiceCount - 1);
        
        this.instruments.lead.triggerRelease(note);
    }
    
    // Release notes if too many are playing
    checkLeadPolyphony() {
        if (this.leadVoiceCount > this.maxLeadVoices) {
            // Release the oldest note
            const oldestNote = this.leadActiveNotes.values().next().value;
            if (oldestNote) {
                this.noteOff(oldestNote);
            }
        }
    }
    
    // Handle note on/off for the pad
    padNoteOn(note, velocity = 1) {
        if (!this.initialized) return;
        
        this.padActiveNotes.add(note);
        this.padVoiceCount++;
        this.checkPadPolyphony();
        
        this.instruments.pad.triggerAttack(note, undefined, velocity);
    }
    
    padNoteOff(note) {
        if (!this.initialized) return;
        
        this.padActiveNotes.delete(note);
        this.padVoiceCount = Math.max(0, this.padVoiceCount - 1);
        
        this.instruments.pad.triggerRelease(note);
    }
    
    // Release notes if too many are playing
    checkPadPolyphony() {
        if (this.padVoiceCount > this.maxPadVoices) {
            // Release the oldest note
            const oldestNote = this.padActiveNotes.values().next().value;
            if (oldestNote) {
                this.padNoteOff(oldestNote);
            }
        }
    }
    
    getInstrument(name) {
        return this.instruments[name];
    }

    // Set effects for different workout phases
    setWorkEffects() {
        console.log('[Instruments] Applying work effects...');
        // Ensure all instruments are properly connected
        Object.values(this.instruments).forEach(instrument => {
            if (instrument && typeof instrument.volume !== 'undefined') {
                console.log(`[Instruments] Ramping up volume for ${instrument.constructor.name}`);
                instrument.volume.rampTo(0, 0.5);
            }
        });
        
        console.log('[Instruments] Work effects applied');
    }

    setRestEffects() {
        console.log('[Instruments] Applying rest effects...');
        // Ensure all instruments are properly connected
        Object.values(this.instruments).forEach(instrument => {
            if (instrument && typeof instrument.volume !== 'undefined') {
                console.log(`[Instruments] Lowering volume for ${instrument.constructor.name}`);
                instrument.volume.rampTo(-10, 0.5);
            }
        });
        
        console.log('[Instruments] Rest effects applied');
    }
}

// Create and export a default instance of Instruments
const instruments = new Instruments();

export { instruments };
