// Forest Whispers Audio Implementation
class ForestAudio {
    constructor() {
        this.context = null;
        this.master = null;
        this.sounds = {};
        this.isPlaying = false;
    }

    async initialize() {
        // Use the global Tone context
        this.context = Tone.context;
        
        // Master output chain with reverb
        this.master = new Tone.Channel().toDestination();
        const reverb = new Tone.Reverb({
            decay: 5,
            wet: 0.3
        }).connect(this.master);
        
        // Make sure the output property is defined for the visualizer
        this.output = this.master;

        // Initialize sound layers
        await this.initializeForestBed();
        await this.initializeTreeVoices();
        await this.initializeCreatureCalls();
    }

    async initializeForestBed() {
        // Wind base
        const wind = new Tone.Noise("pink");
        const windFilter = new Tone.Filter({
            type: "lowpass",
            frequency: 150,  // Lower frequency to reduce static
            rolloff: -48     // Steep rolloff (valid options: -12, -24, -48, -96)
        });
        const windLFO = new Tone.LFO({
            frequency: 0.1,
            min: 100,
            max: 300
        }).connect(windFilter.frequency);
        
        wind.connect(windFilter);
        windFilter.connect(this.master);
        this.sounds.wind = { source: wind, filter: windFilter, lfo: windLFO };

        // Thunder rumble
        const thunder = new Tone.Noise("brown");
        const thunderFilter = new Tone.Filter({
            type: "lowpass",
            frequency: 100
        });
        thunder.connect(thunderFilter);
        thunderFilter.connect(this.master);
        this.sounds.thunder = { source: thunder, filter: thunderFilter };
    }

    async initializeTreeVoices() {
        // Wooden percussion
        const woodSynth = new Tone.MetalSynth({
            frequency: 200,
            envelope: {
                attack: 0.01,
                decay: 0.5,
                release: 1
            },
            harmonicity: 0.5,
            modulationIndex: 10,
            resonance: 200,
            octaves: 1.5
        });
        const woodGain = new Tone.Gain(0.3).connect(this.master);
        woodSynth.connect(woodGain);
        this.sounds.wood = { synth: woodSynth, gain: woodGain };

        // Branch creaks
        const creak = new Tone.NoiseSynth({
            noise: {
                type: "brown"
            },
            envelope: {
                attack: 0.1,
                decay: 0.2,
                sustain: 0.2,
                release: 0.5
            }
        });
        const creakFilter = new Tone.Filter({
            type: "bandpass",
            frequency: 500,
            Q: 2
        });
        creak.connect(creakFilter);
        creakFilter.connect(this.master);
        this.sounds.creak = { synth: creak, filter: creakFilter };
    }

    async initializeCreatureCalls() {
        // Bird calls
        const birdSynth = new Tone.Synth({
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.02,
                decay: 0.1,
                sustain: 0,
                release: 0.1
            }
        });
        const birdGain = new Tone.Gain(0.2).connect(this.master);
        birdSynth.connect(birdGain);
        this.sounds.bird = { synth: birdSynth, gain: birdGain };

        // Insect sounds
        const insectSynth = new Tone.AMSynth({
            harmonicity: 2,
            oscillator: {
                type: "triangle"
            },
            envelope: {
                attack: 0.1,
                decay: 0.2,
                sustain: 0.3,
                release: 0.4
            }
        });
        const insectGain = new Tone.Gain(0.1).connect(this.master);
        insectSynth.connect(insectGain);
        this.sounds.insect = { synth: insectSynth, gain: insectGain };
    }

    updateControls(params) {
        // Handle both object and positional parameters
        let canopy, understory, forestFloor;
        
        if (typeof params === 'object') {
            // Use the new parameter names
            canopy = params.canopy !== undefined ? params.canopy : 0.5;
            understory = params.understory !== undefined ? params.understory : 0.5;
            forestFloor = params.forestFloor !== undefined ? params.forestFloor : 0.5;
            
            // Backward compatibility with old parameter names
            if (params.birds !== undefined) canopy = params.birds;
            if (params.leaves !== undefined) understory = params.leaves;
            if (params.wind !== undefined) forestFloor = params.wind;
        } else {
            // Positional parameters (legacy)
            canopy = arguments[0] || 0.5;
            understory = arguments[1] || 0.5;
            forestFloor = arguments[2] || 0.5;
        }
        
        // Update forest floor sounds (wind and thunder)
        const forestFloorVolume = -20 + (forestFloor * 20);
        if (this.sounds.wind && this.sounds.wind.source) {
            this.sounds.wind.source.volume.rampTo(forestFloorVolume, 0.1);
        }
        if (this.sounds.thunder && this.sounds.thunder.source) {
            this.sounds.thunder.source.volume.rampTo(forestFloorVolume - 10, 0.1);
        }

        // Update canopy sounds (bird calls)
        if (this.sounds.bird && this.sounds.bird.gain) {
            this.sounds.bird.gain.gain.rampTo(canopy * 0.3, 0.1);
        }
        
        // Update understory sounds (insects)
        if (this.sounds.insect && this.sounds.insect.gain) {
            this.sounds.insect.gain.gain.rampTo(understory * 0.2, 0.1);
        }
        
        // Update wood percussion (shared between understory and forest floor)
        if (this.sounds.wood && this.sounds.wood.gain) {
            this.sounds.wood.gain.gain.rampTo((understory + forestFloor) * 0.2, 0.1);
        }
    }

    start() {
        if (this.isPlaying) return;
        
        // Start continuous sounds
        this.sounds.wind.source.start();
        this.sounds.wind.lfo.start();
        this.sounds.thunder.source.start();
        
        // Schedule random events
        this.scheduleRandomEvents();
        
        this.isPlaying = true;
    }

    stop() {
        if (!this.isPlaying) return;
        
        // Stop all sounds
        Object.values(this.sounds).forEach(sound => {
            if (sound.source && sound.source.stop) {
                sound.source.stop();
            }
            if (sound.lfo && sound.lfo.stop) {
                sound.lfo.stop();
            }
        });
        
        Tone.Transport.stop();
        this.isPlaying = false;
    }

    scheduleRandomEvents() {
        // Schedule bird calls
        Tone.Transport.scheduleRepeat(time => {
            if (Math.random() < 0.3) {
                const note = Math.random() < 0.5 ? "C6" : "E6";
                this.sounds.bird.synth.triggerAttackRelease(note, "16n", time);
            }
        }, "4n");

        // Schedule wood percussion
        Tone.Transport.scheduleRepeat(time => {
            if (Math.random() < 0.2) {
                this.sounds.wood.synth.triggerAttackRelease("C4", "8n", time);
            }
        }, "2n");

        // Schedule insect sounds
        Tone.Transport.scheduleRepeat(time => {
            if (Math.random() < 0.4) {
                const freq = 2000 + Math.random() * 2000;
                this.sounds.insect.synth.triggerAttackRelease(freq, "32n", time);
            }
        }, "16n");

        // Start transport
        Tone.Transport.start();
    }
}

// Export the audio engine
export const forestAudio = new ForestAudio();
