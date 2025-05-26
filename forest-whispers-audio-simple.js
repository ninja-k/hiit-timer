// Simple Forest Whispers Audio Implementation
export class ForestWhispersAudio {
    constructor() {
        this.wind = null;
        this.birds = null;
        this.leaves = null;
        this.isPlaying = false;
        this.initialized = false;
    }

    async createAudioNodes() {
        try {
            console.log('Creating audio nodes...');
            
            // Create wind sound with filter and volume
            this.wind = new Tone.Noise('pink');
            this.windFilter = new Tone.Filter({
                frequency: 300,
                type: 'lowpass',
                rolloff: -24,
                Q: 1
            });
            this.windVol = new Tone.Volume(-15);
            
            // Create birds sound with filter and LFO
            this.birds = new Tone.Noise('white');
            this.birdsFilter = new Tone.Filter({
                frequency: 3000,
                type: 'bandpass',
                rolloff: -24,
                Q: 5
            });
            this.birdsVol = new Tone.Volume(-20);
            
            // Create LFO for bird chirps
            this.birdsLFO = new Tone.LFO({
                frequency: 0.3,
                min: 1200,
                max: 3000,
                type: 'sine'
            });
            
            // Create leaves sound with filter
            this.leaves = new Tone.Noise('brown');
            this.leavesFilter = new Tone.Filter({
                frequency: 1000,
                type: 'highpass',
                rolloff: -24,
                Q: 1
            });
            this.leavesVol = new Tone.Volume(-25);
            
            // Connect all nodes
            this.wind.chain(this.windFilter, this.windVol, Tone.Destination);
            this.birds.chain(this.birdsFilter, this.birdsVol, Tone.Destination);
            this.leaves.chain(this.leavesFilter, this.leavesVol, Tone.Destination);
            
            // Connect LFO to filter frequency
            this.birdsLFO.connect(this.birdsFilter.frequency);
            
            console.log('Audio nodes created and connected');
            return true;
        } catch (error) {
            console.error('Error creating audio nodes:', error);
            this.cleanup();
            throw error;
        }
    }
    
    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('Initializing audio...');
            
            // Initialize audio nodes first
            await this.createAudioNodes();
            
            // Start LFOs
            if (this.birdsLFO) {
                this.birdsLFO.start();
            }
            
            // Set initial volumes
            this.windLevel = 0.7;
            this.birdsLevel = 0.7;
            this.leavesLevel = 0.7;
            
            this.initialized = true;
            console.log('Audio initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            this.initialized = false;
            throw error;
        }
    }

    async start() {
        try {
            if (!this.initialized) {
                await this.initialize();
            }
            
            // Ensure audio context is running
            if (Tone.context.state !== 'running') {
                console.log('Starting audio context...');
                await Tone.start();
                console.log('Audio context state:', Tone.context.state);
            }
            
            // Start all sound sources if they exist
            if (this.wind) this.wind.start();
            if (this.birds) this.birds.start();
            if (this.leaves) this.leaves.start();
            if (this.birdsLFO) this.birdsLFO.start();
            
            this.isPlaying = true;
            console.log('Audio playback started');
            return true;
        } catch (error) {
            console.error('Error starting audio:', error);
            this.isPlaying = false;
            throw error;
        }
    }
    
    stop() {
        console.log('Stopping all audio...');
        
        try {
            // Stop all sound sources if they exist
            if (this.wind) {
                this.wind.stop();
                this.wind.dispose();
            }
            
            if (this.birds) {
                this.birds.stop();
                this.birds.dispose();
            }
            
            if (this.leaves) {
                this.leaves.stop();
                this.leaves.dispose();
            }
            
            // Stop and clean up LFOs
            if (this.birdsLFO) {
                this.birdsLFO.stop();
                this.birdsLFO.dispose();
            }
            
            // Clean up filters and volumes
            const cleanUpNode = (node) => {
                if (node) {
                    node.disconnect();
                    if (typeof node.dispose === 'function') {
                        node.dispose();
                    }
                }
            };
            
            cleanUpNode(this.windFilter);
            cleanUpNode(this.windVol);
            cleanUpNode(this.birdsFilter);
            cleanUpNode(this.birdsVol);
            cleanUpNode(this.leavesFilter);
            cleanUpNode(this.leavesVol);
            
            this.isPlaying = false;
            console.log('Audio stopped and cleaned up');
        } catch (error) {
            console.error('Error stopping audio:', error);
            throw error;
        }
    }
    
    // Control methods
    set windLevel(value) {
        if (this.windVol) {
            // Convert 0-1 range to decibels (-60 to 0)
            const db = (value * 60) - 60;
            this.windVol.volume.rampTo(db, 0.1);
            console.log(`Wind level set to ${value} (${db}dB)`);
        }
    }
    
    set birdsLevel(value) {
        if (this.birdsVol) {
            // Convert 0-1 range to decibels (-60 to 0)
            const db = (value * 60) - 60;
            this.birdsVol.volume.rampTo(db, 0.1);
            console.log(`Birds level set to ${value} (${db}dB)`);
        }
    }
    
    set leavesLevel(value) {
        if (this.leavesVol) {
            // Convert 0-1 range to decibels (-60 to 0)
            const db = (value * 60) - 60;
            this.leavesVol.volume.rampTo(db, 0.1);
            console.log(`Leaves level set to ${value} (${db}dB)`);
        }
    }
}

// Export a singleton instance
export const forestWhispersAudio = new ForestWhispersAudio();
