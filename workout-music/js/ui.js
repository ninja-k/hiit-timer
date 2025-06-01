import { WorkoutMusic } from './workout-music-fixed-v3.js';
import { motivation } from './motivation.js';

class UIController {
    /**
     * @param {WorkoutMusic} workoutMusic - The workout music instance to control
     */
    constructor(workoutMusic) {
        this.workoutMusic = workoutMusic;
        this.initializeElements();
        this.setupEventListeners();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Basic controls
        this.startBtn = document.getElementById('startBtn');
        this.styleSelect = document.getElementById('styleSelect');
        this.intensitySlider = document.getElementById('intensitySlider');
        this.intensityValue = document.getElementById('intensityValue');
        this.bpmSlider = document.getElementById('bpmSlider');
        this.bpmValue = document.getElementById('bpmValue');
        this.voiceCues = document.getElementById('voiceCues');
        this.status = document.getElementById('status');
        this.visualizer = document.getElementById('visualizer');
        
        // Audio context elements
        this.audioInitOverlay = document.getElementById('audioInitOverlay');
        this.initAudioBtn = document.getElementById('initAudioBtn');
        
        // Current state
        this.isWorkPhase = false;
        this.workoutStartTime = null;
        this.workoutTimer = null;
        this.phaseTimer = null;
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Initialize audio button
        if (this.initAudioBtn) {
            this.initAudioBtn.addEventListener('click', () => this.initializeAudio());
        }
        
        // Start/Stop button
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.togglePlayback());
        }
        
        // BPM Slider
        if (this.bpmSlider && this.bpmValue) {
            this.bpmSlider.value = 128;
            this.bpmValue.textContent = '128';
            this.bpmSlider.addEventListener('input', (e) => {
                const bpm = parseInt(e.target.value);
                this.bpmValue.textContent = bpm;
                if (this.workoutMusic) {
                    this.workoutMusic.setBPM(bpm);
                }
            });
        }
        
        // Intensity Slider
        if (this.intensitySlider && this.intensityValue) {
            this.intensitySlider.value = 7;
            this.intensityValue.textContent = '7';
            this.intensitySlider.addEventListener('input', (e) => {
                const intensity = parseInt(e.target.value);
                this.intensityValue.textContent = intensity;
                if (this.workoutMusic) {
                    this.workoutMusic.setIntensity(intensity);
                }
            });
        }
        
        // Style Select
        if (this.styleSelect) {
            this.styleSelect.addEventListener('change', (e) => {
                if (this.workoutMusic) {
                    this.workoutMusic.setStyle(e.target.value);
                }
            });
        }
        
        // Voice Cues Toggle
        if (this.voiceCues) {
            this.voiceCues.addEventListener('change', (e) => {
                if (this.workoutMusic) {
                    this.workoutMusic.setVoiceCues(e.target.checked);
                }
            });
        }
    }
    
    /**
     * Initialize audio context
     */
    async initializeAudio() {
        try {
            // Initialize audio on first interaction
            if (!this.workoutMusic.initialized) {
                await this.workoutMusic.initializeOnInteraction();
            }
            this.audioInitOverlay.classList.add('hidden');
            if (this.startBtn) this.startBtn.disabled = false;
            this.updateStatus('Audio initialized. Ready to start!', 'success');
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            this.updateStatus('Failed to initialize audio: ' + error.message, 'error');
        }
    }
    
    /**
     * Toggle playback state
     */
    async togglePlayback() {
        if (!this.workoutMusic) return;
        
        if (this.workoutMusic.isPlaying) {
            await this.workoutMusic.stop();
            this.updateUIState(false);
            this.updateStatus('Workout stopped');
        } else {
            try {
                // Initialize audio if not already done
                if (!this.workoutMusic.initialized) {
                    await this.workoutMusic.initializeOnInteraction();
                    this.audioInitOverlay.classList.add('hidden');
                }
                
                await this.workoutMusic.start();
                this.updateUIState(true);
                this.updateStatus('Workout started!', 'success');
            } catch (error) {
                console.error('Playback error:', error);
                this.updateStatus('Error: ' + error.message, 'error');
            }
        }
    }
    
    /**
     * Update status message
     * @param {string} message - Status message to display
     * @param {string} [type='info'] - Message type: 'info', 'success', or 'error'
     */
    updateStatus(message, type = 'info') {
        if (!this.status) return;
        
        this.status.textContent = message;
        this.status.className = 'status-message';
        
        // Set status color based on type
        if (type === 'error') {
            this.status.style.color = '#ff4444';
        } else if (type === 'success') {
            this.status.style.color = '#4CAF50';
        } else {
            this.status.style.color = '';
        }
    }
    
    /**
     * Update UI based on playback state
     * @param {boolean} isPlaying - Whether audio is currently playing
     */
    updateUIState(isPlaying) {
        if (this.startBtn) {
            this.startBtn.innerHTML = isPlaying 
                ? '<span class="btn-icon">⏹️</span> Stop' 
                : '<span class="btn-icon">▶️</span> Start Workout';
        }
        
        // Disable controls while playing
        const controls = [
            this.styleSelect,
            this.intensitySlider,
            this.bpmSlider,
            this.voiceCues
        ];
        
        controls.forEach(control => {
            if (control) control.disabled = isPlaying;
        });
    }
}

// Export the UIController class for use in other modules
export { UIController };
