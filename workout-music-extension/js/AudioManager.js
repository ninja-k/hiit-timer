import { stylePresets } from './workout-music-presets.js';
import { LocalAudioManager } from './LocalAudioManager.js';

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.localAudio = new LocalAudioManager();
        this.initialized = false;
        this.isPlaying = false;
        this.playbackTimer = null;
        this.currentPattern = null;
        this.currentBPM = 120;
        this.currentLoop = null;
    }

    async initialize() {
        try {
            // Initialize the audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Initialize the local audio manager
            await this.localAudio.initialize(this.audioContext);
            
            this.initialized = true;
            this.isPlaying = false;
            this.playbackTimer = null;
            this.currentStep = 0;
            this.stepsPerBeat = 4; // 16th notes
            this.noteTime = 0.0;
            this.tempo = 120;
            
            console.log('AudioManager initialized');
            return true;
        } catch (error) {
            console.error('Error initializing AudioManager:', error);
            this.initialized = false;
            throw error;
        }
    }

    // Start playback of the current pattern
    startPlayback(pattern, bpm = 120) {
        if (!this.initialized) {
            console.warn('AudioManager not initialized');
            return;
        }
        
        if (this.isPlaying) {
            this.stopPlayback();
        }
        
        this.tempo = bpm;
        this.currentPattern = pattern || [];
        this.isPlaying = true;
        this.currentStep = 0;
        this.noteTime = this.audioContext.currentTime + 0.1; // Start slightly in the future
        
        // Calculate time per step (in seconds)
        const secondsPerBeat = 60.0 / this.tempo;
        this.stepTime = secondsPerBeat / 4; // 16th notes
        
        this.scheduleSteps();
    }
    
    // Stop playback
    stopPlayback() {
        this.isPlaying = false;
        if (this.playbackTimer) {
            clearTimeout(this.playbackTimer);
            this.playbackTimer = null;
        }
    }
    
    // Schedule the next steps of the pattern
    scheduleSteps() {
        if (!this.isPlaying) return;
        
        const lookahead = 0.1; // Schedule 100ms ahead
        const currentTime = this.audioContext.currentTime;
        
        while (this.noteTime < currentTime + lookahead) {
            this.playStep(this.currentStep);
            this.nextStep();
        }
        
        // Schedule next update
        this.playbackTimer = setTimeout(() => this.scheduleSteps(), lookahead * 1000);
    }
    
    // Play a single step in the pattern
    playStep(step) {
        if (!this.currentPattern[step]) return;
        
        const notes = this.currentPattern[step];
        const time = this.noteTime;
        
        // Play each note in the step
        for (const [soundName, velocity] of Object.entries(notes)) {
            if (velocity > 0) {
                this.playDrumSound(soundName, time, velocity);
            }
        }
    }
    
    // Move to the next step
    nextStep() {
        this.currentStep = (this.currentStep + 1) % (this.currentPattern.length || 1);
        this.noteTime += this.stepTime;
    }
    
    // Play a drum sound using our local audio manager
    playDrumSound(soundName, time = 0, velocity = 1.0) {
        if (!this.initialized) {
            console.warn('AudioManager not initialized');
            return;
        }

        try {
            // Map sound names to our local audio manager
            const soundMap = {
                'kick': 'kick',
                'snare': 'snare',
                'hihat': 'hihat',
                'clap': 'clap',
                'kick1': 'kick',
                'snare1': 'snare',
                'hihat1': 'hihat',
                'clap1': 'clap',
                'hh': 'hihat',
                'oh': 'hihat',
                'ch': 'hihat',
                'ride': 'hihat',
                'tom': 'kick',
                'tom1': 'kick',
                'tom2': 'kick',
                'rim': 'snare',
                'rim1': 'snare',
                'rim2': 'snare',
                'bass': 'kick',
                'lead': 'hihat',
                'guitar': 'snare',
                'fx': 'clap',
                'chords': 'clap'
            };

            const mappedSound = soundMap[soundName.toLowerCase()];
            if (!mappedSound) {
                console.warn(`No mapping for sound: ${soundName}`);
                return;
            }

            // Play the sound using our local audio manager
            this.localAudio.playSound(mappedSound, time, velocity);
        } catch (error) {
            console.error('Error playing drum sound:', error);
        }
    }

    // Update the BPM (beats per minute)
    setBPM(bpm) {
        console.log(`Setting BPM to ${bpm}`);
        this.currentBPM = bpm;
        
        // If using Tone.js, update it as well
        if (window.Tone && Tone.Transport) {
            Tone.Transport.bpm.rampTo(bpm, 0.1);
        }
    }

    // Start playback of the pattern
    startPlayback(pattern, bpm, onStep) {
        if (!this.initialized) {
            throw new Error('AudioManager not initialized');
        }

        try {
            // Store the current pattern and BPM
            this.currentPattern = pattern;
            this.currentBPM = bpm;
            
            // Stop any existing playback
            this.stopPlayback();
            
            // Set BPM
            this.setBPM(bpm);
            
            // Get the current style to determine which instruments to use
            const style = window.currentStyle || 'edm';
            const instrumentMap = {
                'hiphop': ['kick', 'snare', 'hihat', 'bass', 'guitar', 'fx', 'chords'],
                'rock': ['kick', 'snare', 'hihat', 'guitar', 'bass', 'chords'],
                'edm': ['kick', 'snare', 'hihat', 'bass', 'chords', 'lead']
            };
            
            const instruments = instrumentMap[style] || instrumentMap['edm'];
            
            // Calculate timing values
            const now = this.audioContext.currentTime;
            const lookahead = 0.1; // Schedule 100ms ahead
            const scheduleAheadTime = 0.1; // Schedule 100ms of audio
            const secondsPerBeat = 60 / bpm;
            const stepsPerBeat = 4; // 16th notes
            const stepDuration = secondsPerBeat / stepsPerBeat;
            const patternDuration = pattern.length * stepDuration;
            
            console.log(`Starting playback at ${bpm} BPM, step duration: ${stepDuration}s`);
            console.log(`Pattern duration: ${patternDuration}s`);
            
            // Store scheduler state
            const schedulerState = {
                currentStep: 0,
                nextStepTime: now,
                lastScheduledTime: 0
            };
            
            const scheduleNotes = () => {
                if (!this.isPlaying) return;
                
                const currentTime = this.audioContext.currentTime;
                
                // Only schedule if we're not too far ahead
                if (schedulerState.nextStepTime < currentTime + scheduleAheadTime) {
                    const stepIndex = schedulerState.currentStep % pattern.length;
                    const step = pattern[stepIndex];
                    
                    if (step && Array.isArray(step)) {
                        // Call onStep callback with the current step
                        if (onStep && typeof onStep === 'function') {
                            onStep(stepIndex);
                        }
                        
                        // Play each instrument in this step
                        step.forEach((value, i) => {
                            const instrumentName = instruments[i];
                            if (value > 0 && instrumentName) {
                                try {
                                    this.playDrumSound(instrumentName, schedulerState.nextStepTime, value);
                                } catch (error) {
                                    console.error(`Error playing ${instrumentName}:`, error);
                                }
                            }
                        });
                    }
                    
                    // Move to next step
                    schedulerState.currentStep++;
                    schedulerState.nextStepTime += stepDuration;
                    
                    // Handle pattern looping
                    if (schedulerState.currentStep >= pattern.length) {
                        schedulerState.currentStep = 0;
                    }
                }
                
                // Schedule next frame if we need to
                if (schedulerState.nextStepTime < currentTime + scheduleAheadTime * 2) {
                    // If we're running low on scheduled notes, schedule more immediately
                    scheduleNotes();
                } else {
                    // Otherwise, use requestAnimationFrame for better performance
                    this.animationFrame = requestAnimationFrame(() => {
                        // Only schedule if we're still playing
                        if (this.isPlaying) {
                            scheduleNotes();
                        }
                    });
                }
            };
            
            // Start the scheduler
            this.isPlaying = true;
            this.animationFrame = requestAnimationFrame(scheduleNotes);
            console.log('Playback started');
            
        } catch (error) {
            console.error('Error in startPlayback:', error);
            this.isPlaying = false;
            throw error;
        }
    }

    // Stop playback
    stopPlayback() {
        try {
            // Clear any scheduled timeouts
            if (this.playbackTimer) {
                clearTimeout(this.playbackTimer);
                this.playbackTimer = null;
            }
            
            // Stop any ongoing audio
            if (this.localAudio && typeof this.localAudio.stopAll === 'function') {
                this.localAudio.stopAll();
            }
            
            // Reset playback state
            this.isPlaying = false;
            console.log('Playback stopped');
            
        } catch (error) {
            console.error('Error stopping playback:', error);
            this.isPlaying = false;
            throw error;
        }
    }

    // Clean up resources
    dispose() {
        this.stopPlayback();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.initialized = false;
    }
}

export { AudioManager };
