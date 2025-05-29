// Main WorkoutMusic class with speech synthesis support
export class WorkoutMusic {
    constructor() {
        // Prevent multiple instances
        if (window.workoutMusicInstance) {
            console.warn('WorkoutMusic instance already exists - returning existing instance');
            return window.workoutMusicInstance;
        }
        
        console.log('Creating new WorkoutMusic instance');
        
        // Store instance globally before any async operations
        window.workoutMusicInstance = this;
        
        // Audio state
        this.isPlaying = false;
        this.audioContext = null;
        this.initialized = false;
        this.initializing = false;
        
        // Music settings with default values
        this.currentBPM = 128;
        this.currentStyle = 'edm';
        this.intensity = 5; // 1-10 scale
        this.voiceCues = true;
        
        // Style presets
        this.stylePresets = {
            edm: {
                name: 'EDM',
                instruments: ['kick', 'snare', 'hihat', 'bass'],
                pattern: [
                    // Kick, Snare, HiHat, Bass
                    [1, 0, 1, 1], [0, 0, 1, 0], [0, 0, 1, 1], [1, 0, 1, 0],
                    [1, 1, 1, 0], [0, 0, 1, 1], [1, 0, 1, 0], [0, 1, 1, 1]
                ],
                baseFrequency: 110,
                bpmRange: { min: 120, max: 150 },
                intensityMultiplier: 1.6,
                swing: 0.2
            },
            rock: {
                name: 'Rock',
                instruments: ['kick', 'snare', 'hihat', 'guitar'],
                pattern: [
                    [1, 0, 0, 1], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 1, 1],
                    [1, 0, 0, 1], [0, 0, 1, 0], [1, 1, 0, 0], [0, 0, 1, 1]
                ],
                baseFrequency: 150,
                bpmRange: { min: 90, max: 120 },
                intensityMultiplier: 1.2
            },
            hiphop: {
                name: 'Hip Hop',
                instruments: ['kick', 'snare', 'hihat', 'bass'],
                pattern: [
                    // More syncopated kick pattern, off-beat snares
                    [1, 0, 0, 1], [0, 0, 1, 0], [0, 1, 0, 0], [1, 0, 1, 0],
                    [0, 0, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1], [0, 0, 1, 0]
                ],
                baseFrequency: 75,
                bpmRange: { min: 75, max: 105 },
                intensityMultiplier: 0.9,
                swing: 0.3
            }
        };
        
        // Audio nodes and state
        this.instruments = {};
        this.currentPattern = [];
        this.currentStep = 0;
        this.patternLength = 8;
        
        // Speech synthesis
        this.speechSynthesis = window.speechSynthesis;
        this.speechUtterance = null;
        
        // Initialize UI
        this.initializeUI();
        
        // Initialize audio context
        this.initializeAudioNodes();
        
        console.log('WorkoutMusic instance created and initialized');
    }
    
    /**
     * Initialize the UI event listeners
     */
    initializeUI() {
        console.log('Initializing UI...');
        
        // Get DOM elements
        this.initBtn = document.getElementById('initBtn');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.bpmRange = document.getElementById('bpmRange');
        this.bpmValue = document.getElementById('bpmValue');
        this.intensityRange = document.getElementById('intensityRange');
        this.intensityValue = document.getElementById('intensityValue');
        this.styleSelect = document.getElementById('styleSelect');
        this.voiceCuesCheckbox = document.getElementById('voiceCues');
        this.statusElement = document.getElementById('status');
        
        // Set initial UI state
        this.startBtn.disabled = true;
        this.stopBtn.disabled = true;
        
        // Set up event listeners
        this.initBtn.addEventListener('click', () => this.initializeAudio());
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        
        // Update BPM and transport when slider changes
        this.bpmRange.addEventListener('input', (e) => {
            this.currentBPM = parseInt(e.target.value);
            this.bpmValue.textContent = this.currentBPM;
            if (this.isPlaying) {
                Tone.Transport.bpm.value = this.currentBPM;
            }
            this.updateStatus(`BPM set to ${this.currentBPM}`);
            this.updatePattern();
        });
        
        // Update intensity and pattern when slider changes
        this.intensityRange.addEventListener('input', (e) => {
            this.intensity = parseInt(e.target.value);
            this.intensityValue.textContent = this.intensity;
            this.updateStatus(`Intensity set to ${this.intensity}`);
            this.updatePattern();
        });
        
        // Handle style changes
        this.styleSelect.addEventListener('change', (e) => {
            const style = this.stylePresets[e.target.value];
            if (!style) return;
            
            this.currentStyle = e.target.value;
            
            // Update BPM range based on style
            this.bpmRange.min = style.bpmRange.min;
            this.bpmRange.max = style.bpmRange.max;
            
            // Ensure current BPM is within new range
            if (this.currentBPM < style.bpmRange.min) this.currentBPM = style.bpmRange.min;
            if (this.currentBPM > style.bpmRange.max) this.currentBPM = style.bpmRange.max;
            
            this.bpmRange.value = this.currentBPM;
            this.bpmValue.textContent = this.currentBPM;
            
            this.updateStatus(`Style set to ${style.name}`);
            this.updatePattern();
        });
        
        // Update voice cues setting
        this.voiceCuesCheckbox.addEventListener('change', (e) => {
            this.voiceCues = e.target.checked;
            this.updateStatus(`Voice cues ${this.voiceCues ? 'enabled' : 'disabled'}`);
        });
        
        // Initialize UI with default values
        this.bpmValue.textContent = this.currentBPM;
        this.intensityValue.textContent = this.intensity;
        
        // Set initial style
        const defaultStyle = this.stylePresets[this.currentStyle];
        this.bpmRange.min = defaultStyle.bpmRange.min;
        this.bpmRange.max = defaultStyle.bpmRange.max;
        this.bpmRange.value = this.currentBPM;
        
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
        
        this.initializing = true;
        this.initBtn.disabled = true;
        
        try {
            // Create or resume audio context
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('Created new AudioContext');
            }
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('Resumed AudioContext');
            }
            
            this.initialized = true;
            this.initializing = false;
            
            // Enable start button
            this.startBtn.disabled = false;
            
            this.updateStatus('Audio initialized. Click Start to begin your workout!');
            this.speak('Audio initialized. Ready to start your workout!');
            
            // Initialize Tone.js after user interaction
            await Tone.start();
            console.log('Tone.js started');
            
        } catch (error) {
            console.error('Error initializing audio:', error);
            this.updateStatus('Error initializing audio: ' + error.message, 'error');
        }
    }
    
    /**
     * Start the workout music
     */
    // Initialize audio nodes for different instruments
    initializeAudioNodes() {
        // Create audio nodes for each instrument type
        this.instruments = {
            kick: new Tone.MembraneSynth({
                pitchDecay: 0.05,
            }).toDestination(),
            
            snare: new Tone.NoiseSynth({
                noise: {
                    type: 'white',
                },
                envelope: {
                    attack: 0.001,
                    decay: 0.2,
                    sustain: 0.1,
                    release: 0.1,
                }
            }).toDestination(),
            
            hihat: new Tone.MetalSynth({
                frequency: 200,
                envelope: {
                    attack: 0.001,
                    decay: 0.1,
                    release: 0.01
                },
                harmonicity: 5.1,
                modulationIndex: 32,
                resonance: 4000,
                octaves: 1.5
            }).toDestination(),
            
            bass: new Tone.MonoSynth({
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.1,
                    decay: 0.3,
                    sustain: 0.4,
                    release: 0.2
                }
            }).toDestination(),
            
            guitar: new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type: 'fatsawtooth',
                    count: 3,
                    spread: 30
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.5,
                    release: 0.4,
                    attackCurve: 'exponential'
                }
            }).toDestination()
        };
    }
    
    // Update the current pattern based on style and intensity
    updatePattern() {
        const style = this.stylePresets[this.currentStyle];
        const intensityFactor = this.intensity / 5; // Normalize to 0.2-2.0 range
        
        // Scale pattern intensity
        this.currentPattern = style.pattern.map(step => 
            step.map((value, i) => 
                value * intensityFactor * style.intensityMultiplier
            )
        );
        
        console.log('Pattern updated:', {
            style: style.name,
            intensity: this.intensity,
            pattern: this.currentPattern
        });
    }
    
    // Play a single step of the pattern
    playStep(step) {
        const style = this.stylePresets[this.currentStyle];
        
        style.instruments.forEach((instrument, i) => {
            if (step[i] > 0) {
                this.playInstrument(instrument, step[i]);
            }
        });
    }
    
    // Play a specific instrument sound with style-specific variations
    playInstrument(instrument, velocity) {
        const now = Tone.now();
        const style = this.stylePresets[this.currentStyle];
        const swing = style.swing || 0;
        
        // Apply swing timing (delays even-numbered 16th notes)
        const swingTime = (this.currentStep % 2 === 1) ? swing * 0.1 : 0;
        const playTime = now + swingTime;
        
        switch(instrument) {
            case 'kick':
                if (this.currentStyle === 'edm') {
                    this.instruments.kick.envelope.attack = 0.01;
                    this.instruments.kick.envelope.decay = 0.5;
                    this.instruments.kick.triggerAttackRelease('C1', '8n', playTime, velocity * 1.2);
                } else if (this.currentStyle === 'hiphop') {
                    this.instruments.kick.envelope.attack = 0.02;
                    this.instruments.kick.envelope.decay = 0.8;
                    this.instruments.kick.triggerAttackRelease('F1', '16n', playTime, velocity * 0.9);
                } else {
                    this.instruments.kick.triggerAttackRelease('C1', '8n', playTime, velocity);
                }
                break;
                
            case 'snare':
                if (this.currentStyle === 'hiphop') {
                    this.instruments.snare.envelope.decay = 0.3;
                    this.instruments.snare.triggerAttackRelease('16n', playTime, velocity * 0.6);
                } else {
                    this.instruments.snare.triggerAttackRelease('8n', playTime, velocity * 0.5);
                }
                break;
                
            case 'hihat':
                if (this.currentStyle === 'edm') {
                    this.instruments.hihat.envelope.decay = 0.05;
                    this.instruments.hihat.triggerAttackRelease('C7', '32n', playTime, velocity * 0.2);
                } else if (this.currentStyle === 'hiphop') {
                    this.instruments.hihat.envelope.decay = 0.1;
                    this.instruments.hihat.triggerAttackRelease('A6', '16n', playTime, velocity * 0.25);
                } else {
                    this.instruments.hihat.triggerAttackRelease('C6', '16n', playTime, velocity * 0.3);
                }
                break;
                
            case 'bass':
                if (this.currentStyle === 'edm') {
                    this.instruments.bass.oscillator.type = 'sawtooth';
                    this.instruments.bass.triggerAttackRelease('C2', '8n', playTime, velocity * 0.8);
                } else if (this.currentStyle === 'hiphop') {
                    this.instruments.bass.oscillator.type = 'sine';
                    this.instruments.bass.triggerAttackRelease('F1', '16n', playTime, velocity * 0.6);
                } else {
                    this.instruments.bass.triggerAttackRelease('C2', '8n', playTime, velocity * 0.7);
                }
                break;
                
            case 'guitar':
                const chords = {
                    edm: ['C3', 'G3', 'A3', 'F3'],
                    rock: ['E3', 'B3', 'C#4', 'A3'],
                    hiphop: ['F#2', 'D3', 'E3', 'B3']
                };
                const chord = chords[this.currentStyle][Math.floor(Math.random() * 4)];
                this.instruments.guitar.triggerAttackRelease(chord, '8n', playTime, velocity * 0.4);
                break;
        }
    }
    
    start = async () => {
        if (!this.initialized) {
            this.updateStatus('Please initialize audio first', 'error');
            return;
        }
        
        if (this.isPlaying) {
            this.updateStatus('Workout is already playing');
            return;
        }
        
        try {
            this.isPlaying = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            
            // Initialize or update pattern
            this.updatePattern();
            this.currentStep = 0;
            
            // Start Tone.js transport
            await Tone.start();
            Tone.Transport.bpm.value = this.currentBPM;
            
            // Schedule the pattern
            Tone.Transport.scheduleRepeat((time) => {
                // Play current step
                this.playStep(this.currentPattern[this.currentStep]);
                
                // Update beat counter and speak if needed
                if (this.voiceCues && this.currentStep % 2 === 0) {
                    const beatNumber = (this.currentStep / 2) + 1;
                    this.speak(`Beat ${beatNumber}`);
                }
                
                // Move to next step
                this.currentStep = (this.currentStep + 1) % this.patternLength;
                
            }, '16n'); // 16th notes for more rhythmic precision
            
            Tone.Transport.start();
            
            this.updateStatus(`Workout started at ${this.currentBPM} BPM (${this.stylePresets[this.currentStyle].name})`);
            this.speak('Workout started!');
            
        } catch (error) {
            console.error('Error starting workout:', error);
            this.updateStatus('Error starting workout: ' + error.message, 'error');
            this.isPlaying = false;
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
        }
    }
    
    /**
     * Stop the workout music
     */
    stop = () => {
        if (!this.isPlaying) return;
        
        try {
            // Stop Tone.js transport
            Tone.Transport.stop();
            Tone.Transport.cancel();
            
            this.isPlaying = false;
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
            
            this.updateStatus('Workout stopped');
            this.speak('Workout stopped');
            
        } catch (error) {
            console.error('Error stopping workout:', error);
            this.updateStatus('Error stopping workout: ' + error.message, 'error');
        }
    }
    
    /**
     * Speak text using the Web Speech API
     * @param {string} text - The text to speak
     */
    speak(text) {
        if (!this.voiceCues) return;
        
        // Cancel any current speech
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        
        // Create and speak the utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        // Try to get a nice voice
        const voices = this.speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => 
            voice.lang.startsWith('en-') && voice.name.includes('Female')
        );
        
        if (englishVoice) {
            utterance.voice = englishVoice;
        }
        
        this.speechSynthesis.speak(utterance);
    }
    
    /**
     * Update the status display
     * @param {string} message - The status message
     * @param {string} [type='info'] - The message type (info, error, success)
     */
    updateStatus(message, type = 'info') {
        if (!this.statusElement) return;
        
        this.statusElement.textContent = message;
        this.statusElement.style.color = type === 'error' ? '#d32f2f' : '#333';
        
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}
