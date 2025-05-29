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
                    [1,0,1,1,1,0], [0,0,1,0,0,0], [0,0,1,1,0,0], [1,0,1,0,0,1],
                    [1,1,1,0,0,0], [0,0,1,1,0,0], [1,0,1,0,1,0], [0,1,1,1,0,0]
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
                    [1,0,0,1,1,0], [0,0,1,0,0,0], [0,1,0,0,0,0], [0,0,1,1,0,1],
                    [1,0,0,0,1,0], [0,0,1,0,0,0], [1,1,0,1,0,1], [0,0,1,0,0,0],
                    [1,0,0,1,1,0], [0,0,1,0,0,0], [0,1,0,0,0,0], [0,0,1,1,0,1],
                    [1,0,0,0,1,0], [0,0,1,0,0,0], [1,1,0,1,0,1], [0,0,1,0,1,0]
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
                    [1,0,1,1,1,0], [0,0,1,0,0,0], [0,1,0,0,0,0], [1,0,1,0,0,1],
                    [0,0,1,1,0,0], [1,0,1,0,0,0], [0,1,0,0,1,0], [0,0,1,0,0,1],
                    [1,0,1,1,1,0], [0,0,1,0,0,0], [0,1,0,0,0,0], [1,0,1,0,0,1],
                    [0,0,1,1,0,0], [1,0,1,0,0,0], [0,1,0,0,1,0], [0,0,1,0,0,1]
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
        this.testMaskingBtn = document.getElementById('test-masking');
        
        // Set initial UI state
        this.startBtn.disabled = true;
        this.stopBtn.disabled = true;
        
        // Set up event listeners
        this.initBtn.addEventListener('click', () => this.initializeAudio());
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        
        // Add test button for frequency masking visualization
        if (this.testMaskingBtn) {
            this.testMaskingBtn.addEventListener('click', () => this.testFrequencyMasking());
            console.log('Test masking button listener added');
        } else {
            console.warn('Test masking button not found in the DOM');
        }
        
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
        
        // Define frequency ranges for each instrument for frequency masking
        this.instrumentFrequencyRanges = {
            kick: { primary: [40, 120], secondary: [120, 250] },    // Sub-bass to low-mids
            snare: { primary: [180, 600], secondary: [2000, 8000] }, // Low-mids and high snap
            hihat: { primary: [6000, 16000], secondary: [2000, 6000] }, // High frequencies
            bass: { primary: [60, 250], secondary: [250, 500] },    // Low frequencies
            guitar: { primary: [300, 1500], secondary: [1500, 4000] }, // Mids
            chords: { primary: [250, 2000], secondary: [2000, 5000] }, // Wide mid range
            lead: { primary: [800, 4000], secondary: [4000, 8000] },  // Upper mids
            fx: { primary: [2000, 10000], secondary: [500, 2000] }   // Mostly highs
        };
        
        // Initialize dynamic EQ for frequency masking
        this.dynamicEQ = {};
        
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
        
        // Now that instruments are initialized, create the dynamic EQs
        this.createDynamicEQs();
        
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
        
        // Connect instruments through effects
        for (const [name, instrument] of Object.entries(this.instruments)) {
            // Disconnect any existing connections
            instrument.disconnect();
            
            // Get dynamic EQ for this instrument if available
            const dynamicEQ = this.dynamicEQ[name];
            
            // Special handling for kick - don't apply high-pass as strongly
            if (name === 'kick') {
                const chain = [
                    new Tone.Filter(60, "highpass")  // Lighter high-pass for kick
                ];
                
                // Add dynamic EQ if available
                if (dynamicEQ) {
                    chain.push(dynamicEQ.primary);
                    chain.push(dynamicEQ.secondary);
                    // Add competing bands
                    dynamicEQ.competing.forEach(comp => chain.push(comp.band));
                }
                
                // Add the rest of the effects
                chain.push(
                    styleEQ,
                    this.effects.distortion,
                    this.effects.bitCrusher,
                    this.effects.delay,
                    this.effects.reverb,
                    this.masterCompressor
                );
                
                // Connect the chain
                instrument.chain(...chain);
            } else {
                // Connect other instruments through the standard chain
                const chain = [
                    this.effects.highPass  // First apply high-pass
                ];
                
                // Add dynamic EQ if available
                if (dynamicEQ) {
                    chain.push(dynamicEQ.primary);
                    chain.push(dynamicEQ.secondary);
                    // Add competing bands
                    dynamicEQ.competing.forEach(comp => chain.push(comp.band));
                }
                
                // Add the rest of the effects
                chain.push(
                    styleEQ,                 // Then style-specific EQ
                    this.effects.distortion,
                    this.effects.bitCrusher,
                    this.effects.delay,
                    this.effects.reverb,
                    this.masterCompressor   // End with master compressor
                );
                
                // Connect the chain
                instrument.chain(...chain);
            }
        }
        
        console.log(`Applied ${this.currentStyle} EQ settings`, {
            low: styleEQ.low,
            mid: styleEQ.mid,
            high: styleEQ.high
        });
        
        console.log('Effects updated:', {
            reverb: this.effects.reverb.decay,
            delay: this.effects.delay.wet.value,
            distortion: style.effects.distortion || 'off',
            bitCrusher: style.effects.bitCrusher || 'off'
        });
    }
    
    /**
     * Create dynamic EQs for frequency masking between instruments
     */
    createDynamicEQs() {
        console.log('Creating dynamic EQs for frequency masking...');
        
        // Debug: List all available instruments
        console.log('Available instruments:', Object.keys(this.instruments));
        
        // Create a dynamic EQ for each instrument
        for (const instrumentName of Object.keys(this.instrumentFrequencyRanges)) {
            // Skip if instrument doesn't exist in our setup
            if (!this.instruments[instrumentName]) {
                console.log(`Skipping dynamic EQ for ${instrumentName} - instrument not found`);
                continue;
            }
            
            const range = this.instrumentFrequencyRanges[instrumentName];
            
            // Create a 5-band parametric EQ for each instrument
            this.dynamicEQ[instrumentName] = {
                // Main band for primary frequency range
                primary: new Tone.Filter({
                    type: "peaking",
                    frequency: (range.primary[0] + range.primary[1]) / 2, // Center frequency
                    Q: 1.0,
                    gain: 0 // Initial gain (will be adjusted dynamically)
                }),
                // Secondary band
                secondary: new Tone.Filter({
                    type: "peaking",
                    frequency: (range.secondary[0] + range.secondary[1]) / 2,
                    Q: 1.0,
                    gain: 0
                }),
                // Competing bands - will be used to duck frequencies when other instruments play
                competing: []
            };
            
            console.log(`Created dynamic EQ for ${instrumentName}`, {
                primaryFreq: this.dynamicEQ[instrumentName].primary.frequency.value,
                secondaryFreq: this.dynamicEQ[instrumentName].secondary.frequency.value
            });
        }
        
        // Set up competing bands by analyzing frequency overlaps
        for (const [name1, eq1] of Object.entries(this.dynamicEQ)) {
            for (const [name2, eq2] of Object.entries(this.dynamicEQ)) {
                // Skip comparing an instrument with itself
                if (name1 === name2) continue;
                
                const range1 = this.instrumentFrequencyRanges[name1];
                const range2 = this.instrumentFrequencyRanges[name2];
                
                // Check if primary ranges overlap
                if (this.rangesOverlap(range1.primary, range2.primary)) {
                    // Create a competing band for instrument 1 at instrument 2's primary frequency
                    const competingBand = new Tone.Filter({
                        type: "peaking",
                        frequency: (range2.primary[0] + range2.primary[1]) / 2,
                        Q: 1.2, // Slightly narrower Q for more precise ducking
                        gain: 0  // Initial gain
                    });
                    
                    eq1.competing.push({
                        instrument: name2,
                        band: competingBand,
                        range: range2.primary
                    });
                    
                    console.log(`Added competing band for ${name1} against ${name2}`);
                }
            }
        }
    }
    
    /**
     * Check if two frequency ranges overlap
     */
    rangesOverlap(range1, range2) {
        return (range1[0] <= range2[1] && range1[1] >= range2[0]);
    }
    
    /**
     * Apply frequency masking when an instrument plays
     * @param {string} playingInstrument - The instrument that is currently playing
     */
    applyFrequencyMasking(playingInstrument) {
        if (!this.dynamicEQ[playingInstrument]) return;
        
        const now = Tone.now();
        const playingRange = this.instrumentFrequencyRanges[playingInstrument];
        
        // Boost the playing instrument's primary frequency range slightly
        const boostAmount = 2; // +2dB boost
        this.dynamicEQ[playingInstrument].primary.gain.setValueAtTime(boostAmount, now);
        
        // Track which instruments are being masked for debugging
        const maskedInstruments = [];
        
        // For each instrument, check if it competes with the playing instrument
        for (const [name, eq] of Object.entries(this.dynamicEQ)) {
            // Skip the playing instrument
            if (name === playingInstrument) continue;
            
            // Check competing bands
            for (const competing of eq.competing) {
                if (competing.instrument === playingInstrument) {
                    // Duck the competing frequency range
                    const duckAmount = -3; // -3dB cut
                    competing.band.gain.cancelScheduledValues(now);
                    competing.band.gain.setValueAtTime(duckAmount, now);
                    competing.band.gain.linearRampToValueAtTime(0, now + 0.1); // Return to normal over 100ms
                    
                    // Add to masked instruments for logging
                    maskedInstruments.push({
                        name,
                        frequency: competing.band.frequency.value,
                        duckAmount
                    });
                }
            }
        }
        
        // Schedule the playing instrument's boost to return to normal
        this.dynamicEQ[playingInstrument].primary.gain.linearRampToValueAtTime(0, now + 0.15);
        
        // Log frequency masking activity (only log occasionally to avoid console spam)
        if (Math.random() < 0.1) { // Log 10% of the time to reduce console spam
            console.log(`Frequency masking: ${playingInstrument} playing`, {
                primaryFreq: this.dynamicEQ[playingInstrument].primary.frequency.value.toFixed(0) + 'Hz',
                boost: `+${boostAmount}dB`,
                maskedInstruments: maskedInstruments.map(i => 
                    `${i.name} @ ${i.frequency.toFixed(0)}Hz (${i.duckAmount}dB)`
                )
            });
        }
        
        // Always update visualization when an instrument plays
        this.updateFrequencyMaskingVisualization(playingInstrument, maskedInstruments);
    }
    
    /**
     * Update visualization for frequency masking (if UI element exists)
     * @param {string} playingInstrument - Currently playing instrument
     * @param {Array} maskedInstruments - Instruments being masked
     */
    updateFrequencyMaskingVisualization(playingInstrument, maskedInstruments) {
        // Check if visualization element exists
        const vizElement = document.getElementById('frequency-masking-viz');
        if (!vizElement) {
            console.warn('Frequency masking visualization element not found!');
            return;
        }
        
        console.log('Updating frequency masking visualization for:', playingInstrument);
        
        // Create a simple visualization of the frequency spectrum
        const freqSpectrum = document.createElement('div');
        freqSpectrum.style.width = '100%';
        freqSpectrum.style.height = '50px';
        freqSpectrum.style.background = 'linear-gradient(to right, #1a1a2e, #16213e, #0f3460, #e94560)';
        freqSpectrum.style.position = 'relative';
        freqSpectrum.style.marginTop = '5px';
        freqSpectrum.style.borderRadius = '3px';
        
        // Add playing instrument marker
        const playingEQ = this.dynamicEQ[playingInstrument];
        if (playingEQ) {
            const primaryFreq = playingEQ.primary.frequency.value;
            const marker = document.createElement('div');
            const position = this.logFreqToPosition(primaryFreq);
            
            marker.style.position = 'absolute';
            marker.style.left = `${position}%`;
            marker.style.top = '0';
            marker.style.width = '3px';
            marker.style.height = '100%';
            marker.style.backgroundColor = '#00ff00';
            marker.title = `${playingInstrument}: ${primaryFreq.toFixed(0)}Hz`;
            
            freqSpectrum.appendChild(marker);
        }
        
        // Add masked instrument markers
        maskedInstruments.forEach(inst => {
            const marker = document.createElement('div');
            const position = this.logFreqToPosition(inst.frequency);
            
            marker.style.position = 'absolute';
            marker.style.left = `${position}%`;
            marker.style.top = '0';
            marker.style.width = '3px';
            marker.style.height = '100%';
            marker.style.backgroundColor = '#ff0000';
            marker.title = `${inst.name}: ${inst.frequency.toFixed(0)}Hz (${inst.duckAmount}dB)`;
            
            freqSpectrum.appendChild(marker);
        });
        
        // Clear previous visualization and add new one
        vizElement.innerHTML = '';
        vizElement.appendChild(freqSpectrum);
        
        // Add legend
        const legend = document.createElement('div');
        legend.style.fontSize = '10px';
        legend.style.marginTop = '2px';
        legend.innerHTML = `<span style="color:#00ff00">▮</span> ${playingInstrument} playing | 
                           <span style="color:#ff0000">▮</span> masked frequencies | 
                           20Hz ← → 20kHz`;
        
        vizElement.appendChild(legend);
    }
    
    /**
     * Convert frequency to position on logarithmic scale (20Hz-20kHz)
     * @param {number} freq - Frequency in Hz
     * @returns {number} - Position as percentage (0-100)
     */
    logFreqToPosition(freq) {
        // Convert to logarithmic scale between 20Hz and 20kHz
        const minFreq = Math.log10(20);
        const maxFreq = Math.log10(20000);
        const logFreq = Math.log10(Math.max(20, Math.min(20000, freq)));
        
        return ((logFreq - minFreq) / (maxFreq - minFreq)) * 100;
    }
    
    /**
     * Test the frequency masking visualization with simulated instrument plays
     */
    testFrequencyMasking() {
        console.log('Testing frequency masking visualization...');
        
        // Create a test visualization element if it doesn't exist
        if (!document.getElementById('frequency-masking-viz')) {
            const container = document.querySelector('.visualization-container');
            if (!container) {
                console.error('Visualization container not found!');
                return;
            }
            
            const vizElement = document.createElement('div');
            vizElement.id = 'frequency-masking-viz';
            vizElement.className = 'frequency-viz';
            container.appendChild(vizElement);
            console.log('Created test visualization element');
        }
        
        // Simulate playing different instruments in sequence
        const instruments = ['kick', 'snare', 'hihat', 'bass'];
        let index = 0;
        
        // Display test message
        this.updateStatus('Testing frequency masking visualization...');
        
        // Create test masking data
        const testMasking = () => {
            if (index >= instruments.length) index = 0;
            const instrument = instruments[index];
            
            console.log(`Test playing ${instrument}`);
            
            // Create simulated masking data
            const maskedInstruments = [];
            for (const otherInstrument of instruments) {
                if (otherInstrument !== instrument) {
                    maskedInstruments.push({
                        name: otherInstrument,
                        frequency: Math.random() * 2000 + 100, // Random frequency between 100-2100Hz
                        duckAmount: -3
                    });
                }
            }
            
            // Update visualization with test data
            this.updateFrequencyMaskingVisualization(instrument, maskedInstruments);
            
            index++;
        };
        
        // Run test every 500ms
        testMasking();
        const testInterval = setInterval(testMasking, 500);
        
        // Stop after 5 seconds
        setTimeout(() => {
            clearInterval(testInterval);
            this.updateStatus('Frequency masking test complete');
        }, 5000);
    }
    
    // Play a specific instrument sound with style-specific variations
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
        
        // Apply frequency masking when this instrument plays
        this.applyFrequencyMasking(instrument);
        
        switch(instrument) {
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
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(
                        this.currentStep % 8 === 0 ? 800 : 400, // Higher pitch for beat 1
                        this.audioContext.currentTime
                    );
                    
                    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.1);
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
}
