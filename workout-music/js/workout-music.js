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
                instruments: ['kick', 'snare', 'hihat', 'bass', 'chords', 'lead'],
                pattern: [
                    // Kick, Snare, HiHat, Bass, Chords, Lead
                    [1, 0, 1, 1, 1, 0], [0, 0, 1, 0, 0, 0], [0, 0, 1, 1, 0, 0], [1, 0, 1, 0, 0, 1],
                    [1, 1, 1, 0, 0, 0], [0, 0, 1, 1, 0, 0], [1, 0, 1, 0, 1, 0], [0, 1, 1, 1, 0, 0]
                ],
                chordProgressions: [
                    // I - V - vi - IV (EDM classic)
                    [
                        ['C3', 'E3', 'G3'], ['G3', 'B3', 'D4'],
                        ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']
                    ],
                    // vi - IV - I - V (Emotional)
                    [
                        ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'],
                        ['C3', 'E3', 'G3'], ['G3', 'B3', 'D4']
                    ]
                ],
                bassNotes: ['C2', 'G2', 'A2', 'F2'],
                leadPattern: [
                    ['C4', 'D4', 'E4', 'F4'],
                    ['E4', 'F4', 'G4', 'A4'],
                    ['G4', 'A4', 'B4', 'C5'],
                    ['A4', 'G4', 'F4', 'E4']
                ],
                baseFrequency: 110,
                bpmRange: { min: 120, max: 150 },
                intensityMultiplier: 1.6,
                swing: 0.2,
                effects: {
                    reverb: 0.3,
                    delay: 0.2,
                    distortion: 0.1
                }
            },
            rock: {
                name: 'Rock',
                instruments: ['kick', 'snare', 'hihat', 'guitar', 'bass', 'chords'],
                pattern: [
                    // Kick, Snare, HiHat, Guitar, Bass, Chords
                    [1, 0, 0, 1, 1, 0], [0, 0, 1, 0, 0, 0], [0, 1, 0, 0, 0, 0], [0, 0, 1, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0], [1, 1, 0, 1, 0, 1], [0, 0, 1, 0, 0, 0],
                    [1, 0, 0, 1, 1, 0], [0, 0, 1, 0, 0, 0], [0, 1, 0, 0, 0, 0], [0, 0, 1, 1, 0, 1],
                    [1, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0], [1, 1, 0, 1, 0, 1], [0, 0, 1, 0, 1, 0]
                ],
                chordProgressions: [
                    // I - V - vi - IV (Rock classic)
                    [
                        ['E3', 'G#3', 'B3'], ['B3', 'D#4', 'F#4'],
                        ['C#4', 'E4', 'G#4'], ['A3', 'C#4', 'E4']
                    ],
                    // I - IV - V - IV (Rock and Roll)
                    [
                        ['E3', 'G#3', 'B3'], ['A3', 'C#4', 'E4'],
                        ['B3', 'D#4', 'F#4'], ['A3', 'C#4', 'E4']
                    ]
                ],
                bassNotes: ['E2', 'B2', 'C#3', 'A2'],
                leadPattern: [
                    ['E4', 'F#4', 'G#4', 'A4'],
                    ['G#4', 'A4', 'B4', 'C#5'],
                    ['B4', 'C#5', 'D#5', 'E5'],
                    ['A4', 'G#4', 'F#4', 'E4']
                ],
                baseFrequency: 150,
                bpmRange: { min: 90, max: 120 },
                intensityMultiplier: 1.2,
                swing: 0.1,
                effects: {
                    reverb: 0.4,
                    delay: 0.1,
                    distortion: 0.6
                }
            },
            hiphop: {
                name: 'Hip Hop',
                instruments: ['kick', 'snare', 'hihat', 'bass', 'chords', 'fx'],
                pattern: [
                    // Kick, Snare, HiHat, Bass, Chords, FX
                    [1, 0, 1, 1, 1, 0], [0, 0, 1, 0, 0, 0], [0, 1, 0, 0, 0, 0], [1, 0, 1, 0, 0, 1],
                    [0, 0, 1, 1, 0, 0], [1, 0, 1, 0, 0, 0], [0, 1, 0, 0, 1, 0], [0, 0, 1, 0, 0, 1],
                    [1, 0, 1, 1, 1, 0], [0, 0, 1, 0, 0, 0], [0, 1, 0, 0, 0, 0], [1, 0, 1, 0, 0, 1],
                    [0, 0, 1, 1, 0, 0], [1, 0, 1, 0, 0, 0], [0, 1, 0, 0, 1, 0], [0, 0, 1, 0, 0, 1]
                ],
                chordProgressions: [
                    // i - VII - v - VI (Hip Hop minor)
                    [
                        ['F#3', 'A3', 'C#4'], ['E3', 'G#3', 'B3'],
                        ['C#3', 'E3', 'G#3'], ['D#3', 'F#3', 'A#3']
                    ],
                    // i - iv - v - VII (Trap progression)
                    [
                        ['F#3', 'A3', 'C#4'], ['B3', 'D#4', 'F#4'],
                        ['C#4', 'E4', 'G#4'], ['E3', 'G#3', 'B3']
                    ]
                ],
                bassNotes: ['F#1', 'E1', 'C#2', 'D#2'],
                fxPattern: [
                    'vinyl_scratch', 'none', 'none', 'snare_roll',
                    'none', 'none', 'riser', 'none'
                ],
                baseFrequency: 75,
                bpmRange: { min: 75, max: 105 },
                intensityMultiplier: 0.9,
                swing: 0.3,
                effects: {
                    reverb: 0.5,
                    delay: 0.4,
                    bitCrusher: 4
                }
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

        console.log('WorkoutMusic instance created');

        // Initialize audio nodes after user interaction
        this.initializeAudioNodes = this.initializeAudioNodes.bind(this);

        // Set up event listeners for audio initialization
        document.addEventListener('click', () => {
            if (!this.initialized) {
                this.initializeAudio();
            }
        }, { once: true });

        // Audio buffer pooling for performance
        this.audioBufferPool = {
            oscillators: [],
            gainNodes: [],
            maxPoolSize: 10
        };
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

        // Performance monitoring elements
        this.audioStateElement = document.getElementById('audio-state');
        this.cpuUsageElement = document.getElementById('cpu-usage');

        // Start performance monitoring
        this.startPerformanceMonitoring();

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
    /**
     * Initialize audio nodes for all instruments
     */
    initializeAudioNodes() {
        console.log('Initializing audio nodes...');

        // Initialize shared effects
        this.effects = {
            reverb: new Tone.Reverb(2),
            delay: new Tone.PingPongDelay({
                delayTime: "8n",
                feedback: 0.4,
                wet: 0.3
            }),
            distortion: new Tone.Distortion(0.4),
            bitCrusher: new Tone.BitCrusher(4),
            // Add high-pass filter to clean up subsonic frequencies
            highPass: new Tone.Filter({
                type: "highpass",
                frequency: 30,  // 30Hz high-pass to remove rumble
                rolloff: -12,   // 12dB/octave rolloff
                Q: 0.5
            }),
            // Style-specific EQ
            eq: {
                edm: new Tone.EQ3({
                    low: 2,      // Boost bass slightly
                    mid: 0,
                    high: 1,     // Slight high-end boost
                    lowFrequency: 250,
                    highFrequency: 2500
                }),
                rock: new Tone.EQ3({
                    low: 1,
                    mid: 2,      // Boost mids for guitar presence
                    high: 1,
                    lowFrequency: 200,
                    highFrequency: 3000
                }),
                hiphop: new Tone.EQ3({
                    low: 3,      // Strong bass boost
                    mid: -1,     // Slight mid cut
                    high: 0,
                    lowFrequency: 100,
                    highFrequency: 2000
                })
            }
        };

        // Add master compressor
        this.masterCompressor = new Tone.Compressor({
            threshold: -20,   // dB
            ratio: 4,        // 4:1 ratio
            attack: 0.003,   // 3ms attack
            release: 0.1     // 100ms release
        }).toDestination();

        // Create sidechain compressor for bass
        this.sidechainCompressor = new Tone.Compressor({
            threshold: -30,   // dB
            ratio: 12,        // Strong compression
            attack: 0.001,    // 1ms attack (very fast)
            release: 0.25      // 250ms release for pumping effect
        });

        // Create a gain node to control the sidechain amount
        this.sidechainGain = new Tone.Gain(0.5); // 50% reduction when triggered

        // Create a click to trigger the sidechain (tied to kick)
        this.sidechainClick = new Tone.Oscillator({
            type: 'sine',
            frequency: 1, // Very low frequency
            volume: -100  // Silent
        }).start();

        // Connect click to sidechain
        this.sidechainClick.connect(this.sidechainCompressor);

        // Connect reverb to master compressor
        this.effects.reverb.chain(this.masterCompressor);

        // Set up bass routing after instruments are created

        // Create instrument nodes (without connecting to destination)
        this.instruments = {
            kick: new Tone.MembraneSynth({
                pitchDecay: 0.05,
                envelope: {
                    attack: 0.001,
                    decay: 0.4,
                    sustain: 0.01,
                    release: 0.1
                }
            }),

            snare: new Tone.NoiseSynth({
                noise: { type: 'white' },
                envelope: {
                    attack: 0.001,
                    decay: 0.2,
                    sustain: 0.01,
                    release: 0.2
                }
            }),

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
            }),

            bass: new Tone.MonoSynth({
                oscillator: { type: 'sine' },
                envelope: {
                    attack: 0.01,
                    decay: 0.3,
                    sustain: 0.5,
                    release: 0.5
                }
            }),

            guitar: new Tone.PolySynth(Tone.Synth, {
                envelope: {
                    attack: 0.02,
                    decay: 0.5,
                    sustain: 0.3,
                    release: 0.5
                }
            }),

            chords: new Tone.PolySynth(Tone.Synth, {
                envelope: {
                    attack: 0.5,
                    decay: 0.5,
                    sustain: 0.5,
                    release: 0.5
                }
            }),

            lead: new Tone.MonoSynth({
                oscillator: { type: 'sawtooth' },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.5,
                    release: 0.2
                }
            }),

            fx: new Tone.NoiseSynth({
                noise: { type: 'pink' },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.01,
                    release: 0.1
                }
            })
        };

        // Set initial volume levels
        Object.values(this.instruments).forEach(instrument => {
            if (instrument.volume) {
                instrument.volume.value = -12; // Start with lower volume
            }
        });

        console.log('Audio nodes initialized');

        // Set up sidechain after instruments are created
        this.setupSidechain();
    }

    // Set up sidechain compression for bass
    setupSidechain() {
        if (!this.instruments.bass || !this.sidechainCompressor || !this.sidechainGain) {
            console.warn('Cannot set up sidechain: required nodes not initialized');
            return;
        }

        try {
            // Disconnect bass from any previous connections
            this.instruments.bass.disconnect();

            // Route bass through sidechain
            this.instruments.bass.chain(
                this.sidechainCompressor,
                this.sidechainGain,
                this.masterCompressor
            );

            console.log('Sidechain effect set up for bass');
        } catch (error) {
            console.error('Error setting up sidechain:', error);
        }
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

            // Initialize Tone.js and audio nodes
            await Tone.start();
            console.log('Tone.js started');

            // Initialize audio nodes after Tone.js is ready
            this.initializeAudioNodes();

            // Set up effects for each style
            this.setupStyleEffects();

        } catch (error) {
            console.error('Error initializing audio:', error);
            this.updateStatus('Error initializing audio: ' + error.message, 'error');
        }
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

    /**
     * Set up style-specific effects for instruments
     */
    setupStyleEffects() {
        const style = this.stylePresets[this.currentStyle];

        // Update effect parameters based on style
        this.effects.reverb.decay = style.effects.reverb || 0.3;
        this.effects.delay.wet.value = style.effects.delay || 0;

        // Configure distortion/bitcrusher based on style
        if (style.effects.distortion) {
            this.effects.distortion.wet.value = 1;
            this.effects.distortion.distortion = style.effects.distortion;
            this.effects.bitCrusher.wet.value = 0;
        } else if (style.effects.bitCrusher) {
            this.effects.bitCrusher.wet.value = 1;
            this.effects.bitCrusher.bits = style.effects.bitCrusher;
            this.effects.distortion.wet.value = 0;
        } else {
            this.effects.distortion.wet.value = 0;
            this.effects.bitCrusher.wet.value = 0;
        }

        // Get the current style's EQ
        const styleEQ = this.effects.eq[this.currentStyle] || this.effects.eq.edm;

        // OPTIMIZED: Simplified effect chains to reduce CPU overhead
        for (const [name, instrument] of Object.entries(this.instruments)) {
            // Disconnect any existing connections
            instrument.disconnect();

            // Simplified chain - fewer nodes = better performance
            if (name === 'kick') {
                // Kick gets minimal processing to preserve punch
                instrument.chain(
                    styleEQ,
                    this.masterCompressor
                );
            } else if (name === 'bass') {
                // Bass gets sidechain only
                instrument.chain(
                    this.sidechainCompressor,
                    this.sidechainGain,
                    styleEQ,
                    this.masterCompressor
                );
            } else {
                // Other instruments get standard processing
                instrument.chain(
                    this.effects.highPass,
                    styleEQ,
                    this.effects.reverb,
                    this.masterCompressor
                );
            }
        }

        console.log(`Optimized ${this.currentStyle} effect chains`, {
            low: styleEQ.low,
            mid: styleEQ.mid,
            high: styleEQ.high,
            effectsActive: {
                reverb: this.effects.reverb.decay,
                delay: this.effects.delay.wet.value,
                distortion: style.effects.distortion || 'off',
                bitCrusher: style.effects.bitCrusher || 'off'
            }
        });
    }

    /**
     * Play a specific instrument sound with style-specific variations
     */
    playInstrument(instrument, velocity) {
        if (!this.instruments[instrument]) {
            console.warn(`Instrument ${instrument} not found`);
            return;
        }
        const now = Tone.now();
        const style = this.stylePresets[this.currentStyle];
        const swing = style.swing || 0;

        // Apply swing timing (delays even-numbered 16th notes)
        const swingTime = (this.currentStep % 2 === 1) ? swing * 0.1 : 0;
        const playTime = now + swingTime;

        switch (instrument) {
            case 'kick':
                if (this.currentStyle === 'edm') {
                    this.instruments.kick.envelope.attack = 0.01;
                    this.instruments.kick.envelope.decay = 0.5;
                    this.instruments.kick.triggerAttackRelease('C1', '8n', playTime, velocity * 1.2);
                    // Trigger sidechain on kick for EDM
                    if (this.sidechainGain) {
                        this.sidechainGain.gain.cancelScheduledValues(playTime);
                        this.sidechainGain.gain.setValueAtTime(0.5, playTime); // 50% volume
                        this.sidechainGain.gain.linearRampToValueAtTime(1.0, playTime + 0.25); // Back to 100% over 250ms
                    }
                } else if (this.currentStyle === 'hiphop') {
                    this.instruments.kick.envelope.attack = 0.02;
                    this.instruments.kick.envelope.decay = 0.8;
                    this.instruments.kick.triggerAttackRelease('F1', '16n', playTime, velocity * 0.9);
                    // Trigger sidechain on kick for Hip Hop
                    if (this.sidechainGain) {
                        this.sidechainGain.gain.cancelScheduledValues(playTime);
                        this.sidechainGain.gain.setValueAtTime(0.3, playTime); // 70% volume reduction
                        this.sidechainGain.gain.linearRampToValueAtTime(1.0, playTime + 0.2); // Back to 100% over 200ms
                    }
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

                // Create a simple beep for beat counting
                if (this.voiceCues && this.currentStep % 2 === 0) {
                    if (!this.beepOscillator) {
                        this.createBeepNodes();
                    }
                    this.playBeep(this.currentStep % 8 === 0);
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

    createBeepNodes() {
        this.beepOscillator = new Tone.Oscillator({
            type: 'sine',
            volume: -20
        }).start();

        this.beepGain = new Tone.Gain(0.5).toDestination();
        this.beepOscillator.connect(this.beepGain);
    }

    playBeep(isStrongBeat) {
        this.beepOscillator.frequency.value = isStrongBeat ? 800 : 400;
        this.beepGain.gain.cancelScheduledValues();
        this.beepGain.gain.setValueAtTime(0.5, 0);
        this.beepGain.gain.exponentialRampToValueAtTime(0.01, 0.1);
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

        // Cancel any ongoing speech
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;  // Normal speed
        utterance.pitch = 1.0; // Normal pitch
        utterance.volume = 0.7; // Slightly lower volume

        // Try to get a nice voice
        const voices = this.speechSynthesis.getVoices();
        const englishVoice = voices.find(voice =>
            voice.lang.startsWith('en-') && voice.name.includes('Female')
        );

        if (englishVoice) {
            utterance.voice = englishVoice;
        }

        this.speechSynthesis.speak(utterance);
        console.log(`Speaking: ${text}`);
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

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        this.performanceStartTime = performance.now();
        this.frameCount = 0;

        const updatePerformanceDisplay = () => {
            // Update audio context state
            if (this.audioStateElement) {
                const state = this.audioContext ? this.audioContext.state : 'Not initialized';
                this.audioStateElement.textContent = state;
                this.audioStateElement.style.color = state === 'running' ? '#4CAF50' : '#666';
            }

            // Basic CPU usage estimation (frame-based)
            if (this.cpuUsageElement) {
                this.frameCount++;
                const elapsed = performance.now() - this.performanceStartTime;

                if (elapsed > 1000) { // Update every second
                    const fps = (this.frameCount / elapsed) * 1000;
                    const cpuUsage = Math.max(0, Math.min(100, (60 - fps) / 60 * 100));

                    this.cpuUsageElement.textContent = `${cpuUsage.toFixed(1)}%`;
                    this.cpuUsageElement.style.color = cpuUsage > 50 ? '#d32f2f' : '#4CAF50';

                    // Reset counters
                    this.performanceStartTime = performance.now();
                    this.frameCount = 0;
                }
            }

            // Continue monitoring
            if (this.audioStateElement || this.cpuUsageElement) {
                requestAnimationFrame(updatePerformanceDisplay);
            }
        };

        // Start the monitoring loop
        requestAnimationFrame(updatePerformanceDisplay);
    }

    /**
     * Get a reusable oscillator from the pool or create a new one
     */
    getPooledOscillator() {
        if (this.audioBufferPool.oscillators.length > 0) {
            return this.audioBufferPool.oscillators.pop();
        }

        return new Tone.Oscillator({
            type: 'sine',
            volume: -20
        });
    }

    /**
     * Return an oscillator to the pool for reuse
     */
    returnOscillatorToPool(oscillator) {
        if (this.audioBufferPool.oscillators.length < this.audioBufferPool.maxPoolSize) {
            oscillator.stop();
            this.audioBufferPool.oscillators.push(oscillator);
        } else {
            oscillator.dispose();
        }
    }
}
