export class LocalAudioManager {
    constructor() {
        this.audioContext = null;
        this.sampleRate = 44100;
        this.buffers = new Map();
        this.initialized = false;
        this.masterGain = null;
        this.compressor = null;
        this.outputNode = null;
    }

    async initialize(audioContext = null) {
        if (this.initialized) return true;
        
        try {
            // Use provided audio context or create a new one
            if (!audioContext) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext({
                    sampleRate: this.sampleRate,
                    latencyHint: 'interactive'
                });
            } else {
                this.audioContext = audioContext;
                this.sampleRate = audioContext.sampleRate;
            }
            
            // Create audio nodes
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.7;
            
            // Add light compression to prevent clipping
            this.compressor = this.audioContext.createDynamicsCompressor();
            this.compressor.threshold.value = -20;
            this.compressor.ratio.value = 4;
            this.compressor.attack.value = 0.003;
            this.compressor.release.value = 0.1;
            
            // Connect nodes
            this.masterGain.connect(this.compressor);
            this.compressor.connect(this.audioContext.destination);
            this.outputNode = this.compressor;
            
            // Create drum sounds
            await Promise.all([
                this._createKickBuffer(),
                this._createSnareBuffer(),
                this._createHihatBuffer(),
                this._createClapBuffer()
            ]);
            
            this.initialized = true;
            console.log('LocalAudioManager initialized');
            return true;
            
        } catch (error) {
            console.error('Error initializing LocalAudioManager:', error);
            this.initialized = false;
            throw new Error(`Audio initialization failed: ${error.message}`);
        }
    }

    playSound(soundName, time = 0, velocity = 1.0) {
        if (!this.initialized) {
            console.warn('AudioManager not initialized');
            return null;
        }

        const buffer = this.buffers.get(soundName);
        if (!buffer) {
            console.warn(`Sound not found: ${soundName}`);
            return null;
        }

        try {
            // Create source and gain nodes
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            // Apply velocity (0-1) to the gain
            const gain = velocity * 0.8 + 0.2; // Keep some minimum gain
            gainNode.gain.value = gain;
            
            // Connect nodes: source -> gain -> masterGain -> compressor -> destination
            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Start playing
            const now = this.audioContext.currentTime;
            source.start(now + Math.max(0, time - now));
            
            // Clean up after playback
            source.onended = () => {
                gainNode.disconnect();
                source.disconnect();
            };
            
            return source;
            
        } catch (error) {
            console.error(`Error playing sound ${soundName}:`, error);
            return null;
        }
    }

    // Helper methods to create audio buffers
    _createKickBuffer() {
        const duration = 0.5;
        const sampleCount = Math.ceil(this.sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, sampleCount, this.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Kick drum parameters
        const startFreq = 150;  // Starting frequency in Hz
        const endFreq = 60;     // Ending frequency in Hz
        const decay = 5;        // Decay rate
        
        for (let i = 0; i < sampleCount; i++) {
            const t = i / this.sampleRate;
            
            // Frequency sweep (exponential decay)
            const freq = endFreq + (startFreq - endFreq) * Math.exp(-15 * t);
            
            // Amplitude envelope (fast attack, exponential decay)
            const env = Math.exp(-decay * t);
            
            // Generate tone with slight distortion
            const tone = Math.sin(2 * Math.PI * freq * t);
            
            // Apply envelope and slight distortion
            channelData[i] = Math.tanh(tone * 2) * env;
        }
        
        this.buffers.set('kick', buffer);
        return buffer;
    }

    _createSnareBuffer() {
        const duration = 0.5;
        const sampleCount = Math.ceil(this.sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, sampleCount, this.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Generate noise
        for (let i = 0; i < sampleCount; i++) {
            // Generate band-limited noise by filtering white noise
            const noise = Math.random() * 2 - 1;
            
            // Apply a simple high-pass filter
            let filteredNoise = 0;
            if (i > 0) {
                filteredNoise = 0.5 * (noise - channelData[i-1]);
            } else {
                filteredNoise = noise;
            }
            
            // Apply envelope (fast attack, medium decay)
            const t = i / this.sampleRate;
            const env = Math.exp(-15 * t) * (1 - Math.exp(-100 * t));
            
            // Mix in a short sine wave at the beginning for more "snap"
            const snap = i < this.sampleRate * 0.01 ? 
                Math.sin(2 * Math.PI * 200 * t) * Math.exp(-200 * t) : 0;
            
            channelData[i] = (filteredNoise * 0.8 + snap * 0.2) * env;
        }
        
        this.buffers.set('snare', buffer);
        return buffer;
    }

    _createHihatBuffer() {
        const duration = 0.2;
        const sampleCount = Math.ceil(this.sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, sampleCount, this.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Generate high-frequency noise with a sharp attack and decay
        for (let i = 0; i < sampleCount; i++) {
            // Generate white noise
            const noise = (Math.random() * 2 - 1) * 0.5;
            
            // Apply a high-pass filter effect
            let filteredNoise = 0;
            if (i > 0) {
                filteredNoise = 0.98 * (noise - channelData[i-1]);
            } else {
                filteredNoise = noise;
            }
            
            // Apply envelope (very fast attack, quick decay)
            const t = i / this.sampleRate;
            const env = Math.exp(-30 * t) * (1 - Math.exp(-200 * t));
            
            // Add some high-frequency emphasis
            const freqBoost = Math.min(1, 0.1 / (t + 0.001));
            
            channelData[i] = filteredNoise * env * freqBoost;
        }
        
        this.buffers.set('hihat', buffer);
        return buffer;
    }

    _createClapBuffer() {
        const duration = 0.6;
        const sampleCount = Math.ceil(this.sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, sampleCount, this.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Initialize buffer with zeros
        for (let i = 0; i < sampleCount; i++) {
            channelData[i] = 0;
        }
        
        // Create multiple noise bursts with slight timing variations
        const numBursts = 3;
        const burstTimes = [0, 0.01, 0.02]; // Slight delay between bursts
        
        for (let burst = 0; burst < numBursts; burst++) {
            const delay = burstTimes[burst % burstTimes.length];
            const start = Math.floor(delay * this.sampleRate);
            const burstLength = Math.floor(0.03 * this.sampleRate);
            
            // Add some randomness to each burst
            const burstGain = 0.7 + Math.random() * 0.3;
            
            for (let i = 0; i < burstLength && start + i < sampleCount; i++) {
                const t = i / this.sampleRate;
                const noise = (Math.random() * 2 - 1) * 0.5;
                
                // Apply a quick envelope to each burst
                const burstEnv = Math.exp(-50 * t) * (1 - Math.exp(-500 * t));
                
                // Add to the buffer with panning variation
                const pan = Math.sin(burst * 1.5) * 0.5; // Slight pan variation between bursts
                channelData[start + i] += noise * burstEnv * burstGain * (1 + pan * (i % 2 === 0 ? 1 : -1));
            }
        }
        
        // Apply overall envelope
        for (let i = 0; i < sampleCount; i++) {
            const t = i / this.sampleRate;
            // Longer decay with a slight curve
            const env = Math.pow(Math.max(0, 1 - t / 0.5), 1.5);
            channelData[i] *= env;
        }
        
        // Apply a slight high-pass filter
        let prev = 0;
        for (let i = 0; i < sampleCount; i++) {
            const current = channelData[i];
            channelData[i] = 0.9 * (current - 0.7 * prev);
            prev = current;
        }
        
        this.buffers.set('clap', buffer);
        return buffer;
    }

    // Add more sound generation methods as needed
}
