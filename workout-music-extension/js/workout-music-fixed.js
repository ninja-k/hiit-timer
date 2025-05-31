// Main WorkoutMusic class with optimized performance monitoring
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
        this.initializing = false;

        // Performance monitoring
        this.performanceStartTime = 0;
        this.frameCount = 0;
        this.lastUpdateTime = 0;
        this.monitoringActive = false;
        this.updateHandle = null;

        // Workout settings
        this.currentBPM = 128;
        this.currentStyle = 'edm';
        this.intensity = 5;
        this.voiceCues = true;
        this.stylePresets = stylePresets;
        this.currentPattern = [];
        this.currentStep = 0;
        this.patternLength = 8;

        // Bind methods
        this.initializeAudio = this.initializeAudio.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.initializeUI = this.initializeUI.bind(this);
        this.updatePattern = this.updatePattern.bind(this);
        this.startPerformanceMonitoring = this.startPerformanceMonitoring.bind(this);
        this.stopPerformanceMonitoring = this.stopPerformanceMonitoring.bind(this);
        this.updatePerformanceDisplay = this.updatePerformanceDisplay.bind(this);

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

    // ... [rest of your existing methods] ...


    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        // Don't start monitoring if no UI elements need it
        if (!this.uiManager.elements.audioStateElement && !this.uiManager.elements.cpuUsageElement) {
            return;
        }
        
        if (this.monitoringActive) return;
        
        this.monitoringActive = true;
        this.performanceStartTime = performance.now();
        this.frameCount = 0;
        this.lastUpdateTime = 0;
        
        // Start with a small delay to prevent immediate UI updates
        setTimeout(() => {
            if (this.monitoringActive) {
                this.updateHandle = requestAnimationFrame(this.updatePerformanceDisplay);
            }
        }, 100);
    }

    /**
     * Update performance display (runs at most once per 500ms)
     */
    updatePerformanceDisplay(timestamp) {
        if (!this.monitoringActive) return;
        
        this.frameCount++;
        const now = performance.now();
        
        // Only update UI every 500ms to reduce CPU usage
        if (now - this.lastUpdateTime > 500) {
            // Update audio state if element exists
            if (this.uiManager.elements.audioStateElement) {
                const state = this.audioManager.audioContext ? 
                    this.audioManager.audioContext.state : 'Not initialized';
                this.uiManager.elements.audioStateElement.textContent = `Audio: ${state}`;
                this.uiManager.elements.audioStateElement.style.color = state === 'running' ? '#4CAF50' : '#';
            }
            
            // Update CPU usage if element exists
            if (this.uiManager.elements.cpuUsageElement) {
                const elapsed = (now - this.performanceStartTime) / 1000;
                const fps = Math.round(this.frameCount / elapsed);
                const load = Math.min(100, Math.max(0, 100 - (1000 / (fps || 1))));
                this.uiManager.elements.cpuUsageElement.textContent = `CPU: ${Math.round(load)}%`;
            }
            
            this.lastUpdateTime = now;
        }
        
        // Schedule next update if still active
        if (this.monitoringActive) {
            this.updateHandle = requestAnimationFrame(this.updatePerformanceDisplay);
        }
    }

    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring() {
        this.monitoringActive = false;
        if (this.updateHandle) {
            cancelAnimationFrame(this.updateHandle);
            this.updateHandle = null;
        }
    }

    /**
     * Clean up resources when destroying the instance
     */
    destroy() {
        this.stop();
        this.stopPerformanceMonitoring();
        if (this.audioManager.dispose) {
            this.audioManager.dispose();
        }
        window.workoutMusicInstance = null;
    }
}
