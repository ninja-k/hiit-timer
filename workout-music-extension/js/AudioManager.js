import { LocalAudioManager } from './LocalAudioManager.js';

class AudioManager {
    static AUDIO_CONTEXT_OPTIONS = {
        sampleRate: 44100,
        latencyHint: 'interactive',
    };

    constructor() {
        this.audioContext = null;
        this.localAudio = new LocalAudioManager();
        this.initialized = false;
        this.isPlaying = false;
        this.currentPattern = [];
        this.currentBPM = 120;
        this.currentStep = 0;
        this.stepTime = 0;
        this.noteTime = 0;
        this.nextStepTime = 0;
        this.scheduleAheadTime = 0.1; // Schedule 100ms ahead
        this.lookahead = 0.1; // 100ms - run scheduling loop every 100ms
        this.scheduleInterval = null;
    }

    async initialize() {
        if (this.initialized) return true;

        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext(AudioManager.AUDIO_CONTEXT_OPTIONS);
            
            // Initialize local audio manager
            await this.localAudio.initialize(this.audioContext);
            
            // Initialize scheduling variables
            this.currentStep = 0;
            this.noteTime = 0;
            this.nextStepTime = this.audioContext.currentTime;
            this.isPlaying = false;
            
            console.log('AudioManager initialized with sample rate:', this.audioContext.sampleRate);
            this.initialized = true;
            return true;
            
        } catch (error) {
            console.error('Error initializing AudioManager:', error);
            this.initialized = false;
            throw new Error(`Audio initialization failed: ${error.message}`);
        }
    }

    // Start playback of the current pattern
    startPlayback(pattern, bpm = 120) {
        if (!this.initialized) {
            throw new Error('AudioManager not initialized');
        }
        
        // Stop any existing playback
        this.stopPlayback();
        
        // Set current state
        this.currentBPM = bpm;
        this.currentPattern = Array.isArray(pattern) ? pattern : [];
        this.currentStep = 0;
        this.isPlaying = true;
        
        // Calculate timing values
        const now = this.audioContext.currentTime;
        const secondsPerBeat = 60.0 / this.currentBPM;
        this.stepTime = secondsPerBeat / 4; // 16th notes
        this.noteTime = now + 0.1; // Start slightly in the future
        this.nextStepTime = now;
        
        console.log(`Starting playback at ${this.currentBPM} BPM, step time: ${this.stepTime.toFixed(4)}s`);
        
        // Start the scheduling loop
        this.scheduleInterval = setInterval(() => this.scheduleSteps(), this.lookahead * 1000);
        
        // Initial scheduling
        this.scheduleSteps();
    }
    
    // Stop playback
    stopPlayback() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        
        // Clear scheduling interval
        if (this.scheduleInterval) {
            clearInterval(this.scheduleInterval);
            this.scheduleInterval = null;
        }
        
        // Clear any pending timeouts
        if (this.playbackTimer) {
            clearTimeout(this.playbackTimer);
            this.playbackTimer = null;
        }
        
        console.log('Playback stopped');
    }
    
    // Schedule the next steps of the pattern
    scheduleSteps() {
        if (!this.isPlaying || !this.currentPattern.length) return;
        
        const currentTime = this.audioContext.currentTime;
        const scheduleAheadTime = 0.1; // Schedule 100ms ahead
        
        // Schedule notes that fall within the next scheduleAheadTime
        while (this.noteTime < currentTime + scheduleAheadTime) {
            const stepStartTime = this.noteTime;
            
            // Play the current step
            if (this.currentPattern[this.currentStep]) {
                this.playStep(this.currentStep, stepStartTime);
            }
            
            // Move to next step
            this.nextStep();
        }
    }
    
    // Play a single step in the pattern
    playStep(stepIndex, time) {
        const step = this.currentPattern[stepIndex];
        if (!step || !Array.isArray(step)) return;
        
        // Play each instrument in this step
        step.forEach((velocity, instrumentIndex) => {
            if (velocity > 0) {
                const instrumentName = this.getInstrumentName(instrumentIndex);
                if (instrumentName) {
                    this.playDrumSound(instrumentName, time, velocity);
                }
            }
        });
    }
    
    // Move to the next step
    nextStep() {
        // Move to next step
        this.currentStep++;
        
        // Loop pattern if needed
        if (this.currentStep >= this.currentPattern.length) {
            this.currentStep = 0;
        }
        
        // Advance time to next step
        this.noteTime += this.stepTime;
    }
    
    // Get instrument name by index
    getInstrumentName(index) {
        const style = window.currentStyle || 'edm';
        const instrumentMap = {
            'hiphop': ['kick', 'snare', 'hihat', 'bass', 'guitar', 'fx', 'chords'],
            'rock': ['kick', 'snare', 'hihat', 'guitar', 'bass', 'chords'],
            'edm': ['kick', 'snare', 'hihat', 'bass', 'chords', 'lead']
        };
        
        const instruments = instrumentMap[style] || instrumentMap['edm'];
        return instruments[index];
    }
    
    // Play a drum sound
    playDrumSound(instrument, time) {
        if (!this.initialized || !this.audioContext || !this.localAudio) {
            console.warn('Audio not initialized or audio context not available');
            return;
        }

        // List of available drum sounds that we know exist
        const availableDrums = ['kick', 'snare', 'hihat', 'clap'];
        
        // Only try to play sounds that we know exist
        if (availableDrums.includes(instrument)) {
            try {
                this.localAudio.playSound(instrument, time);
            } catch (error) {
                console.error(`Error playing ${instrument}:`, error);
            }
        } else {
            // Silently skip unsupported instruments instead of showing errors
            // console.log(`Skipping unsupported instrument: ${instrument}`);
        }
    }
    
    // Set BPM
    setBPM(bpm) {
        this.currentBPM = Math.max(40, Math.min(300, bpm)); // Clamp between 40-300 BPM
        const secondsPerBeat = 60.0 / this.currentBPM;
        this.stepTime = secondsPerBeat / 4; // 16th notes
        
        if (this.isPlaying) {
            // Restart playback with new BPM
            this.startPlayback(this.currentPattern, this.currentBPM);
        }
    }
    
    // Clean up resources
    dispose() {
        this.stopPlayback();
        this.initialized = false;
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        if (this.localAudio) {
            this.localAudio.dispose();
        }
    }
}

export { AudioManager };
