// Main WorkoutMusic class
import { AudioManager } from './AudioManager.js';
import { UIManager } from './UIManager.js';
import { stylePresets } from './workout-music-presets.js';

export class WorkoutMusic {
    constructor() {
        // Prevent multiple instances
        if (window.workoutMusicInstance) {
            console.warn('WorkoutMusic instance already exists - returning existing instance');
            return window.workoutMusicInstance;
        }

        console.log('Creating new WorkoutMusic instance');
        window.workoutMusicInstance = this;

        // Initialize managers
        this.uiManager = new UIManager();
        this.audioManager = new AudioManager();
        this.initialized = false;
        this.isPlaying = false;
        this.initialized = false;
        this.initializing = false;

        // Workout settings
        this.currentBPM = 128;
        this.currentStyle = 'edm';
        this.intensity = 5;
        this.voiceCues = true;
        this.stylePresets = stylePresets;
        this.currentPattern = [];
        this.currentStep = 0;
        this.patternLength = 8;

        // Bind methods to ensure proper 'this' context
        this.initializeAudio = this.initializeAudio.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.initializeUI = this.initializeUI.bind(this);
        this.updatePattern = this.updatePattern.bind(this);
        this.startPerformanceMonitoring = this.startPerformanceMonitoring.bind(this);
        this.onInit = this.onInit.bind(this);
        this.onStart = this.onStart.bind(this);
        this.onStop = this.onStop.bind(this);
        this.onBpmChange = this.onBpmChange.bind(this);
        this.onIntensityChange = this.onIntensityChange.bind(this);
        this.onStyleChange = this.onStyleChange.bind(this);

        // Initialize UI with callbacks
        this.initializeUI();
        console.log('WorkoutMusic instance created');

        // Initialize audio on first user interaction
        document.addEventListener('click', () => {
            if (!this.initialized) {
                this.initializeAudio();
            }
        }, { once: true });
    }

    // Event Handlers
    onInit() {
        console.log('Initializing workout music...');
        this.initializeAudio();
    }

    onStart() {
        console.log('Starting workout...');
        this.start();
    }

    onStop() {
        console.log('Stopping workout...');
        this.stop();
    }

    onBpmChange(bpm) {
        try {
            // Ensure BPM is within valid range (40-220 BPM)
            const newBpm = Math.max(40, Math.min(220, parseInt(bpm, 10)));

            if (isNaN(newBpm)) {
                console.warn('Invalid BPM value:', bpm);
                return;
            }

            console.log(`BPM changing to ${newBpm}`);

            // Update the current BPM
            this.currentBPM = newBpm;

            // Update the audio manager with the new BPM
            if (this.audioManager) {
                this.audioManager.setBPM(newBpm);
            } else {
                console.warn('AudioManager not available');
            }

            // Update UI elements if they exist
            if (this.uiManager?.elements) {
                // Update BPM display
                if (this.uiManager.elements.bpmValue) {
                    this.uiManager.elements.bpmValue.textContent = newBpm;
                }

                // Update BPM range slider if it exists
                if (this.uiManager.elements.bpmRange) {
                    this.uiManager.elements.bpmRange.value = newBpm;
                }

                // Update status message
                this.uiManager.updateStatus(`BPM set to ${newBpm}`);
            }

            console.log(`BPM successfully changed to ${newBpm}`);

        } catch (error) {
            console.error('Error changing BPM:', error);
            if (this.uiManager) {
                this.uiManager.updateStatus('Error changing BPM: ' + (error.message || 'Unknown error'), 'error');
            }
        }
    }

    onIntensityChange(intensity) {
        console.log(`Intensity changed to ${intensity}`);
        const wasPlaying = this.isPlaying;
        this.intensity = intensity;
        this.updatePattern();

        // If audio was playing, restart it to apply the new pattern
        if (wasPlaying) {
            this.stop();
            this.start();
        }
    }

    onStyleChange(style) {
        console.log(`Style changed to ${style}`);
        this.currentStyle = style;
        this.updatePattern();

        // Update audio effects based on style
        if (this.audioManager.setStyle) {
            this.audioManager.setStyle(style);
        }

        // Restart playback if currently playing
        if (this.isPlaying) {
            this.stop();
            this.start();
        }
    }

    /**
     * Initialize the UI with callbacks
     */
    initializeUI() {
        console.log('Initializing UI...');

        this.uiManager.initializeUI({
            onInit: this.onInit.bind(this),
            onStart: this.onStart.bind(this),
            onStop: this.onStop.bind(this),
            onBpmChange: this.onBpmChange.bind(this),
            onIntensityChange: this.onIntensityChange.bind(this),
            onStyleChange: this.onStyleChange.bind(this)
        });

        // Initialize style dropdown if it exists
        if (this.uiManager.elements.styleSelect) {
            this.populateStyleDropdown();
        }

        // Set initial BPM and intensity values
        this.uiManager.elements.bpmValue.textContent = this.currentBPM;
        this.uiManager.elements.bpmRange.value = this.currentBPM;
        this.uiManager.elements.intensityValue.textContent = this.intensity;
        this.uiManager.elements.intensityRange.value = this.intensity;

        // Start performance monitoring
        this.startPerformanceMonitoring();

        console.log('UI initialized');
    }

    /**
     * Initialize the audio context
     */
    initializeAudio = async () => {
        // Prevent multiple initializations
        if (this.initializing) {
            console.log('Audio initialization already in progress');
            return;
        }

        console.group('Audio Initialization');
        this.initializing = true;
        this.uiManager.elements.initBtn.disabled = true;
        this.uiManager.updateStatus('Initializing audio...', 'info');

        try {
            console.log('1. Initializing AudioManager...');
            const audioInitialized = await this.audioManager.initialize();

            if (!audioInitialized) {
                throw new Error('AudioManager failed to initialize');
            }
            console.log('✅ AudioManager initialized');

            console.log('2. Initializing Tone.js...');
            if (typeof Tone === 'undefined') {
                throw new Error('Tone.js is not loaded');
            }

            try {
                await Tone.start();
                console.log('✅ Tone.js started');
                console.log('Tone.js context state:', Tone.context.state);
                console.log('Sample rate:', Tone.context.sampleRate);
            } catch (toneError) {
                console.error('Tone.js initialization failed:', toneError);
                throw new Error(`Tone.js failed to start: ${toneError.message}`);
            }

            console.log('3. Initializing audio patterns...');
            
            // Set up initial pattern
            console.log('4. Setting up initial pattern...');
            this.updatePattern();
            console.log('✅ Pattern updated');

            // Set up style effects (simplified for LocalAudioManager)
            console.log('5. Setting up style effects...');
            this.setupStyleEffects();
            console.log('✅ Style effects set up');

            // Mark as initialized
            this.initialized = true;
            this.initializing = false;

            // Update UI
            this.uiManager.enableButton('startBtn', true);
            this.uiManager.updateStatus('Audio initialized. Ready to start your workout!', 'success');

            console.log('✅ Audio initialization complete');
            console.groupEnd();

        } catch (error) {
            console.error('❌ Audio initialization failed');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);

            this.initialized = false;
            this.initializing = false;

            let errorMessage = 'Error initializing audio';

            if (error.name === 'NotAllowedError') {
                errorMessage = 'Audio permission denied. Please interact with the page first.';
                console.error('Audio permission denied. User interaction is required.');
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'Web Audio API is not supported in this browser.';
                console.error('Browser does not support required audio features');
            } else if (error.message.includes('Tone')) {
                errorMessage = 'Audio engine failed to start. Please refresh the page and try again.';
                console.error('Tone.js related error:', error.message);
            }

            this.uiManager.updateStatus(errorMessage, 'error');
            this.uiManager.enableButton('initBtn', true);

            console.groupEnd();

            // Re-throw the error to be caught by the app's error boundary
            throw error;
        }
    }

    /**
     * Set up style-specific audio effects (simplified for LocalAudioManager)
     */
    setupStyleEffects() {
        const style = this.stylePresets[this.currentStyle];
        
        // In our simplified version, we'll just log the style being used
        // The actual audio effects are handled by the LocalAudioManager
        console.log(`Setting up style: ${style.name}`);
        
        // We can still adjust the global volume based on style if needed
        if (this.audioManager.audioContext) {
            // Apply a small volume adjustment based on style
            const volumeAdjustments = {
                'edm': 1.0,
                'hiphop': 0.9,
                'rock': 1.1
            };
            
            const gainNode = this.audioManager.audioContext.createGain();
            gainNode.gain.value = volumeAdjustments[this.currentStyle] || 1.0;
            
            // In a real implementation, you would connect this to your audio graph
            // For now, we'll just log the adjustment
            console.log(`Adjusted volume for ${this.currentStyle} style`);
        }
        
        console.log(`Style effects set up for ${style.name}`);
    }

    /**
     * Update the current pattern based on style and intensity
     */
    updatePattern() {
        const style = this.stylePresets[this.currentStyle];

        // Map intensity (1-10) to a wider range (0.2-3.0) for more dramatic effect
        const minIntensity = 0.2;  // Lower minimum for softer sounds
        const maxIntensity = 3.0;  // Higher maximum for more impact
        const intensityFactor = minIntensity + (this.intensity / 10) * (maxIntensity - minIntensity);

        // Scale pattern with more dramatic differences
        this.currentPattern = style.pattern.map(step =>
            step.map(value => {
                if (value === 0) return 0;

                // Apply exponential scaling for more noticeable effect
                let scaledValue = value * Math.pow(intensityFactor, 1.8) * style.intensityMultiplier;

                // Map to a dynamic range (0.2-1.0)
                scaledValue = 0.2 + (scaledValue * 0.8);

                // Ensure value stays in valid range with a minimum threshold
                return Math.min(1, Math.max(0.2, scaledValue));
            })
        );

        console.log('Pattern updated with intensity:', {
            style: style.name,
            intensity: this.intensity,
            factor: intensityFactor,
            sampleStep: this.currentPattern[0].map(v => v.toFixed(2)) // Log first step for debugging
        });
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        this.performanceStartTime = performance.now();
        this.frameCount = 0;

        const updatePerformanceDisplay = () => {
            // Update audio context state
            if (this.uiManager.elements.audioStateElement) {
                const state = this.audioManager.audioContext ?
                    this.audioManager.audioContext.state : 'Not initialized';
                this.uiManager.elements.audioStateElement.textContent = `Audio: ${state}`;
                this.uiManager.elements.audioStateElement.style.color = state === 'running' ? '#4CAF50' : '#666';
            }

            // Basic CPU usage estimation (frame-based)
            if (this.uiManager.elements.cpuUsageElement) {
                this.frameCount++;
                const elapsed = performance.now() - this.performanceStartTime;

                if (elapsed > 1000) { // Update every second
                    const fps = (this.frameCount / elapsed) * 1000;
                    const cpuUsage = Math.max(0, Math.min(100, (60 - fps) / 60 * 100));

                    this.uiManager.elements.cpuUsageElement.textContent = `CPU: ${cpuUsage.toFixed(1)}%`;
                    this.uiManager.elements.cpuUsageElement.style.color = cpuUsage > 50 ? '#d32f2f' : '#4CAF50';

                    // Reset counters
                    this.performanceStartTime = performance.now();
                    this.frameCount = 0;
                }
            }


            // Continue monitoring
            if (this.uiManager.elements.audioStateElement || this.uiManager.elements.cpuUsageElement) {
                requestAnimationFrame(updatePerformanceDisplay);
            }
        };

        // Start the monitoring loop
        requestAnimationFrame(updatePerformanceDisplay);
    }


    /**

    // Scale pattern with more dramatic differences
    this.currentPattern = style.pattern.map(step =>
        step.map(value => {
            if (value === 0) return 0;

            // Apply exponential scaling for more noticeable effect
            let scaledValue = value * Math.pow(intensityFactor, 1.8) * style.intensityMultiplier;

            // Map to a dynamic range (0.2-1.0)
            scaledValue = 0.2 + (scaledValue * 0.8);

            // Ensure value stays in valid range with a minimum threshold
            return Math.min(1, Math.max(0.2, scaledValue));
        })
    );

    console.log('Pattern updated with intensity:', {
        style: style.name,
        intensity: this.intensity,
}

console.log('3. Initializing audio patterns...');
        
// Set up initial pattern
console.log('4. Setting up initial pattern...');
this.updatePattern();
console.log('✅ Pattern updated');

// Set up style effects (simplified for LocalAudioManager)
console.log('5. Setting up style effects...');
this.setupStyleEffects();
console.log('✅ Style effects set up');

// Mark as initialized
this.initialized = true;
this.initializing = false;

// Update UI
this.uiManager.enableButton('startBtn', true);
this.uiManager.updateStatus('Audio initialized. Ready to start your workout!', 'success');

console.log('✅ Audio initialization complete');
console.groupEnd();

} catch (error) {
console.error('❌ Audio initialization failed');
console.error('Error name:', error.name);
console.error('Error message:', error.message);
console.error('Error stack:', error.stack);

this.initialized = false;
this.initializing = false;

let errorMessage = 'Error initializing audio';

if (error.name === 'NotAllowedError') {
errorMessage = 'Audio permission denied. Please interact with the page first.';
console.error('Audio permission denied. User interaction is required.');
} else if (error.name === 'NotSupportedError') {
errorMessage = 'Web Audio API is not supported in this browser.';
console.error('Browser does not support required audio features');
} else if (error.message.includes('Tone')) {
errorMessage = 'Audio engine failed to start. Please refresh the page and try again.';
console.error('Tone.js related error:', error.message);
}

this.uiManager.updateStatus(errorMessage, 'error');
this.uiManager.enableButton('initBtn', true);

console.groupEnd();

// Re-throw the error to be caught by the app's error boundary
throw error;
}

/**
* Set up style-specific audio effects (simplified for LocalAudioManager)
*/
setupStyleEffects() {
const style = this.stylePresets[this.currentStyle];
        
// In our simplified version, we'll just log the style being used
// The actual audio effects are handled by the LocalAudioManager
console.log(`Setting up style: ${style.name}`);
        
// We can still adjust the global volume based on style if needed
if (this.audioManager.audioContext) {
// Apply a small volume adjustment based on style
const volumeAdjustments = {
'edm': 1.0,
'hiphop': 0.9,
'rock': 1.1
};
        
const gainNode = this.audioManager.audioContext.createGain();
gainNode.gain.value = volumeAdjustments[this.currentStyle] || 1.0;
        
// In a real implementation, you would connect this to your audio graph
// For now, we'll just log the adjustment
console.log(`Adjusted volume for ${this.currentStyle} style`);
}
        
console.log(`Style effects set up for ${style.name}`);
}

/**
* Update the current pattern based on style and intensity
*/
updatePattern() {
const style = this.stylePresets[this.currentStyle];

// Map intensity (1-10) to a wider range (0.2-3.0) for more dramatic effect
const minIntensity = 0.2;  // Lower minimum for softer sounds
const maxIntensity = 3.0;  // Higher maximum for more impact
const intensityFactor = minIntensity + (this.intensity / 10) * (maxIntensity - minIntensity);

// Scale pattern with more dramatic differences
this.currentPattern = style.pattern.map(step =>
step.map(value => {
if (value === 0) return 0;

// Apply exponential scaling for more noticeable effect
let scaledValue = value * Math.pow(intensityFactor, 1.8) * style.intensityMultiplier;

// Map to a dynamic range (0.2-1.0)
scaledValue = 0.2 + (scaledValue * 0.8);

// Ensure value stays in valid range with a minimum threshold
return Math.min(1, Math.max(0.2, scaledValue));
})
);

console.log('Pattern updated with intensity:', {
style: style.name,
intensity: this.intensity,
factor: intensityFactor,
sampleStep: this.currentPattern[0].map(v => v.toFixed(2)) // Log first step for debugging
});
}

/**
* Start the workout music
* @param {boolean} silent - If true, skips the "Workout started" announcement
*/
async start(silent = false) {
if (!this.initialized) {
console.error('Audio not initialized');
this.uiManager.updateStatus('Please initialize audio first', 'error');
return false;
}

if (this.isPlaying) {
this.uiManager.updateStatus('Workout is already playing');
return false;
}

try {
this.isPlaying = true;
this.uiManager.enableButton('startBtn', false);
this.uiManager.enableButton('stopBtn', true);

// Update pattern based on current settings
this.updatePattern();
this.currentStep = 0;

// Start audio playback using LocalAudioManager
if (!this.audioManager.startPlayback) {
throw new Error('AudioManager does not support playback');
}

// Start the playback with the current pattern and BPM
await this.audioManager.startPlayback(
this.currentPattern,
this.currentBPM,
(step) => {
// This callback is called for each step in the pattern
this.currentStep = step;
        
// Update UI with current step if the element exists
if (this.uiManager.elements?.stepIndicator) {
this.uiManager.elements.stepIndicator.textContent = 
`Step: ${step + 1}/${this.currentPattern.length}`;
}
}
);

// Update UI status
this.uiManager.updateStatus(`Playing at ${this.currentBPM} BPM`, 'success');
        
// Optional: Add a beep or other non-speech audio feedback
if (!silent && this.audioManager.playDrumSound) {
try {
// Play a kick drum sound as feedback
this.audioManager.playDrumSound('kick');
} catch (soundError) {
console.warn('Could not play start sound:', soundError);
}
}
        
return true;
        
} catch (error) {
console.error('Error starting workout:', error);
this.uiManager.updateStatus(`Error: ${error.message || 'Failed to start playback'}`, 'error');
this.isPlaying = false;
this.uiManager.enableButton('startBtn', true);
this.uiManager.enableButton('stopBtn', false);
return false;
}
}

/**
* Start performance monitoring
*/
startPerformanceMonitoring() {
this.performanceStartTime = performance.now();
this.frameCount = 0;

const updatePerformanceDisplay = () => {
// Update audio context state
if (this.uiManager.elements.audioStateElement) {
const state = this.audioManager.audioContext ?
this.audioManager.audioContext.state : 'Not initialized';
this.uiManager.elements.audioStateElement.textContent = `Audio: ${state}`;
this.uiManager.elements.audioStateElement.style.color = state === 'running' ? '#4CAF50' : '#666';

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a style...';
        defaultOption.disabled = true;
        defaultOption.selected = !this.currentStyle;
        select.appendChild(defaultOption);

        // Add style options from presets
        Object.keys(this.stylePresets).forEach(styleKey => {
            const style = this.stylePresets[styleKey];
            const option = document.createElement('option');
            option.value = styleKey;
            option.textContent = style.name || styleKey; // Use 'name' instead of 'displayName'
            option.selected = styleKey === this.currentStyle;
            select.appendChild(option);
        });

        // Add change event listener if not already added
        if (!select.hasAttribute('data-style-listener-added')) {
            select.addEventListener('change', (e) => {
                const newStyle = e.target.value;
                if (newStyle) {
                    this.onStyleChange(newStyle);
                }
            });
            select.setAttribute('data-style-listener-added', 'true');
        }
    }
    /**
     * Clean up resources when destroying the instance
     */
    destroy() {
        this.stop();
        if (this.audioManager) {
            this.audioManager.destroy();
        }
        window.workoutMusicInstance = null;
    }
}

// WorkoutMusic class is already exported in the class declaration above
