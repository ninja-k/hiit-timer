export class UIManager {
    constructor() {
        this.elements = {
            initBtn: document.getElementById('initBtn'),
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            bpmRange: document.getElementById('bpm'),
            bpmValue: document.getElementById('bpm-value'),
            intensityRange: document.getElementById('intensity'),
            intensityValue: document.getElementById('intensity-value'),
            styleSelect: document.getElementById('style'),
            statusElement: document.getElementById('status'),
            audioStateElement: document.getElementById('audio-state'),
            cpuUsageElement: document.getElementById('cpu-usage')
        };
        
        // Safely initialize elements that might be null
        Object.keys(this.elements).forEach(key => {
            if (!this.elements[key]) {
                console.warn(`Element not found: ${key}`);
            }
        });
    }

    initializeUI(callbacks) {
        const { onInit, onStart, onStop, onBpmChange, onIntensityChange, onStyleChange } = callbacks;

        // Set initial UI state
        this.elements.startBtn.disabled = true;
        this.elements.stopBtn.disabled = true;

        // Set up event listeners with proper binding
        if (onInit) {
            this.elements.initBtn.addEventListener('click', (e) => {
                e.preventDefault();
                onInit.call(this, e);
            });
        }
        
        if (onStart) {
            this.elements.startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                onStart.call(this, e);
            });
        }
        
        if (onStop) {
            this.elements.stopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                onStop.call(this, e);
            });
        }

        if (onBpmChange) {
            this.elements.bpmRange.addEventListener('input', (e) => {
                const bpm = parseInt(e.target.value);
                this.elements.bpmValue.textContent = bpm;
                onBpmChange(bpm);
            });
        }

        if (onIntensityChange) {
            this.elements.intensityRange.addEventListener('input', (e) => {
                const intensity = parseInt(e.target.value);
                this.elements.intensityValue.textContent = intensity;
                onIntensityChange.call(this, intensity);
            });
        }

        if (onStyleChange && this.elements.styleSelect) {
            this.elements.styleSelect.addEventListener('change', (e) => {
                const style = e.target.value;
                console.log('Style changed to:', style);
                onStyleChange(style); // Remove .call(this, ...) to maintain correct 'this' context
            });
        }
    }

    updateStatus(message, type = 'info') {
        if (!this.elements.statusElement) return;
        
        this.elements.statusElement.textContent = message;
        this.elements.statusElement.className = `status-${type}`;
        
        // Log to console for debugging
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    updatePerformanceStats(stats) {
        if (this.elements.audioStateElement) {
            this.elements.audioStateElement.textContent = `Audio: ${stats.state || 'unknown'}`;
        }
        if (this.elements.cpuUsageElement) {
            this.elements.cpuUsageElement.textContent = `CPU: ${stats.cpuUsage || 'N/A'}`;
        }
    }

    enableButton(buttonId, enabled) {
        if (this.elements[buttonId]) {
            this.elements[buttonId].disabled = !enabled;
        }
    }

    // Add other UI-related methods...
}
