export class LocalAudioManager {
    constructor() {
        this.audioContext = null;
        this.sampleRate = 44100;
        this.buffers = new Map();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.sampleRate
            });
            
            // Create basic drum sounds
            await this._createKickBuffer();
            await this._createSnareBuffer();
            await this._createHihatBuffer();
            await this._createClapBuffer();
            
            this.initialized = true;
            console.log('LocalAudioManager initialized');
            return true;
        } catch (error) {
            console.error('Error initializing LocalAudioManager:', error);
            throw error;
        }
    }

    playSound(soundName, time = 0) {
        if (!this.initialized) {
            console.warn('AudioManager not initialized');
            return;
        }

        const buffer = this.buffers.get(soundName);
        if (!buffer) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(time);
        return source;
    }

    // Helper methods to create audio buffers
    _createKickBuffer() {
        const duration = 0.5;
        const sampleCount = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, sampleCount, this.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < sampleCount; i++) {
            const t = i / this.sampleRate;
            const freq = 100 * Math.exp(-8 * t);
            const env = Math.exp(-5 * t);
            channelData[i] = Math.sin(2 * Math.PI * freq * t) * env;
        }
        
        this.buffers.set('kick', buffer);
    }

    _createSnareBuffer() {
        const duration = 0.3;
        const sampleCount = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, sampleCount, this.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Noise
        for (let i = 0; i < sampleCount; i++) {
            channelData[i] = Math.random() * 2 - 1;
        }
        
        // Apply envelope
        for (let i = 0; i < sampleCount; i++) {
            const t = i / this.sampleRate;
            const env = Math.exp(-10 * t);
            channelData[i] *= env;
        }
        
        this.buffers.set('snare', buffer);
    }

    _createHihatBuffer() {
        const duration = 0.1;
        const sampleCount = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, sampleCount, this.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // High-passed noise
        for (let i = 0; i < sampleCount; i++) {
            channelData[i] = (Math.random() * 2 - 1) * 0.5;
        }
        
        // Simple high-pass filter
        let prev = 0;
        for (let i = 0; i < sampleCount; i++) {
            const current = channelData[i];
            channelData[i] = current - prev;
            prev = current;
        }
        
        // Apply envelope
        for (let i = 0; i < sampleCount; i++) {
            const t = i / this.sampleRate;
            const env = Math.exp(-50 * t);
            channelData[i] *= env;
        }
        
        this.buffers.set('hihat', buffer);
    }

    _createClapBuffer() {
        const duration = 0.5;
        const sampleCount = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, sampleCount, this.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Create multiple noise bursts
        for (let burst = 0; burst < 5; burst++) {
            const delay = 0.02 * burst;
            const start = Math.floor(delay * this.sampleRate);
            const burstLength = Math.floor(0.02 * this.sampleRate);
            
            for (let i = 0; i < burstLength && start + i < sampleCount; i++) {
                channelData[start + i] += (Math.random() * 2 - 1) * 0.2;
            }
        }
        
        // Apply envelope
        for (let i = 0; i < sampleCount; i++) {
            const t = i / this.sampleRate;
            const env = Math.exp(-15 * t);
            channelData[i] *= env;
        }
        
        this.buffers.set('clap', buffer);
    }

    // Add more sound generation methods as needed
}
