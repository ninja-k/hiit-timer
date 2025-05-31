// Main WorkoutMusic class with optimized performance monitoring
import { AudioManager } from './AudioManager.js';
import { UIManager } from './UIManager.js';
import { stylePresets } from './workout-music-presets.js';

export class WorkoutMusic {
    // Initialize audio context and setup
    async initializeAudio() {
        if (this.initialized) return;
        
        try {
            await this.audioManager.initialize();
            this.initialized = true;
            this.updatePattern();
            console.log('Audio initialized');
        } catch (error) {
            console.error('Error initializing audio:', error);
            throw error;
        }
    }
    
    // Start audio playback
    async start() {
        if (this.isPlaying) return;
        
        try {
            if (!this.initialized) {
                await this.initializeAudio();
            }
            
            // Resume audio context if it's suspended
            if (this.audioManager.audioContext.state === 'suspended') {
                await this.audioManager.audioContext.resume();
            }
            
            this.isPlaying = true;
            this.audioManager.startPlayback(this.currentPattern, this.bpm);
            this.startPerformanceMonitoring();
            console.log('Playback started');
        } catch (error) {
            console.error('Error starting playback:', error);
            throw error;
        }
    }
    
    // Stop audio playback
    stop() {
        if (!this.isPlaying) return;
        
        try {
            this.audioManager.stopPlayback();
            this.isPlaying = false;
            this.stopPerformanceMonitoring();
            console.log('Playback stopped');
        } catch (error) {
            console.error('Error stopping playback:', error);
            throw error;
        }
    }
    
    // Update the current pattern based on style and intensity
    updatePattern() {
        if (!this.stylePresets || !this.stylePresets[this.currentStyle]) {
            console.warn('Invalid style or presets not loaded');
            return;
        }
        
        const style = this.stylePresets[this.currentStyle];
        this.currentPattern = style.pattern;
        
        if (this.audioManager) {
            this.audioManager.currentPattern = this.currentPattern;
        }
        
        console.log('Pattern updated:', this.currentStyle);
    }
    
    startPerformanceMonitoring() {}
    stopPerformanceMonitoring() {}
    updatePerformanceDisplay() {}
    initializeUI() {}
    destroy() {}
    constructor() {
        // Prevent multiple instances
        if (window.workoutMusicInstance) {
            console.warn('WorkoutMusic instance already exists - returning existing instance');
            return window.workoutMusicInstance;
        }

        console.log('Creating new WorkoutMusic instance');
        window.workoutMusicInstance = this;
        
        // Initialize managers
        this.audioManager = new AudioManager();
        this.uiManager = new UIManager();
        
        // Initialize state
        this.initialized = false;
        this.isPlaying = false;
        this.initializing = false;
        this.bpm = 120;
        this.intensity = 5;
        this.currentStyle = 'edm';
        this.currentPattern = [];
        this.currentStep = 0;
        this.patternLength = 8;
        this.voiceCues = true;
        
        // Performance monitoring
        this.performanceStartTime = 0;
        this.frameCount = 0;
        this.lastUpdateTime = 0;
        this.monitoringActive = false;
        this.updateHandle = null;
        
        // Load style presets
        this.stylePresets = stylePresets;

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
