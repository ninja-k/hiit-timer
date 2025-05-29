// Simple drum player to test audio functionality
class SimpleDrumPlayer {
    constructor() {
        this.drums = null;
        this.isPlaying = false;
        this.loop = null;
        this.currentBeat = 0;
        this.currentPattern = {
            kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
            snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        };
    }

    async init() {
        try {
            console.log('Initializing SimpleDrumPlayer...');
            
            // Make sure Tone.js is started
            if (Tone.context.state !== 'running') {
                await Tone.start();
                console.log('Tone.js started, context state:', Tone.context.state);
            }
            
            // Create drums with direct connection to output
            this.drums = {
                kick: new Tone.MembraneSynth({
                    pitchDecay: 0.05,
                    octaves: 5,
                    oscillator: { type: 'sine' },
                    envelope: {
                        attack: 0.001,
                        decay: 0.4,
                        sustain: 0.01,
                        release: 0.4
                    }
                }).toDestination(),
                
                snare: new Tone.NoiseSynth({
                    noise: { type: 'white' },
                    envelope: {
                        attack: 0.001,
                        decay: 0.2,
                        sustain: 0.02,
                        release: 0.2
                    }
                }).toDestination(),
                
                hihat: new Tone.MetalSynth({
                    frequency: 200,
                    envelope: {
                        attack: 0.001,
                        decay: 0.1,
                        release: 0.01
                    },
                    harmonicity: 5.1,
                    modulationIndex: 32,
                    resonance: 4000,
                    octaves: 1.5
                }).toDestination()
            };
            
            // Set volumes
            this.drums.kick.volume.value = 0;   // Full volume
            this.drums.snare.volume.value = -2; // Slightly reduced
            this.drums.hihat.volume.value = -6; // Reduced more
            
            console.log('Drums created and ready');
            
            // Test drums
            this.testDrums();
            
            return true;
        } catch (error) {
            console.error('Error initializing SimpleDrumPlayer:', error);
            return false;
        }
    }
    
    testDrums() {
        console.log('Testing drums...');
        const now = Tone.now();
        
        // Play each drum with a slight delay between them
        this.drums.kick.triggerAttackRelease('C1', '16n', now);
        this.drums.snare.triggerAttackRelease('16n', now + 0.2);
        this.drums.hihat.triggerAttackRelease('16n', now + 0.4);
        
        console.log('Drum test complete');
    }
    
    playDrums(step) {
        if (!this.drums) {
            console.warn('Drums not initialized');
            return;
        }
        
        try {
            const now = Tone.now();
            const velocity = 1.0;
            
            // Play kick
            if (this.currentPattern.kick[step]) {
                console.log('Playing kick drum');
                this.drums.kick.triggerAttackRelease('C1', '16n', now, velocity);
            }
            
            // Play snare
            if (this.currentPattern.snare[step]) {
                console.log('Playing snare drum');
                this.drums.snare.triggerAttackRelease('16n', now, velocity);
            }
            
            // Play hi-hat
            if (this.currentPattern.hihat[step]) {
                console.log('Playing hi-hat');
                this.drums.hihat.triggerAttackRelease('16n', now, velocity);
            }
        } catch (error) {
            console.error('Error playing drums:', error);
        }
    }
    
    start() {
        if (this.isPlaying) {
            console.log('Already playing');
            return;
        }
        
        console.log('Starting drum loop...');
        
        // Reset counter
        this.currentBeat = 0;
        
        // Set up the transport
        Tone.Transport.bpm.value = 120;
        Tone.Transport.cancel(); // Clear any existing scheduled events
        
        // Create a loop that triggers on each 16th note
        this.loop = new Tone.Loop((time) => {
            this.playDrums(this.currentBeat);
            this.currentBeat = (this.currentBeat + 1) % 16;
        }, '16n');
        
        // Start the loop and transport
        this.loop.start(0);
        Tone.Transport.start();
        
        this.isPlaying = true;
        console.log('Drum loop started');
    }
    
    stop() {
        if (!this.isPlaying) {
            console.log('Not playing');
            return;
        }
        
        console.log('Stopping drum loop...');
        
        // Stop the loop and transport
        if (this.loop) {
            this.loop.stop();
        }
        
        Tone.Transport.stop();
        
        this.isPlaying = false;
        console.log('Drum loop stopped');
    }
}

// Create and export the player
const simpleDrumPlayer = new SimpleDrumPlayer();
