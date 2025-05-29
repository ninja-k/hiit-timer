// phi-music-generator.js
// Local music pattern generator using Tone.js synths

// Music generation settings
const DEFAULT_TEMPO = 128;
const DEFAULT_BARS = 8;

// Initialize Tone.js synths
const kickSynth = new Tone.MembraneSynth({
  pitchDecay: 0.05,
  octaves: 5,
  oscillator: { type: 'triangle' },
  envelope: {
    attack: 0.001,
    decay: 0.2,
    sustain: 0.01,
    release: 1.2,
    attackCurve: 'exponential'
  }
}).toDestination();

const snareSynth = new Tone.NoiseSynth({
  noise: { type: 'white' },
  envelope: {
    attack: 0.001,
    decay: 0.2,
    sustain: 0.1,
    release: 0.3,
    attackCurve: 'exponential'
  }
}).toDestination();

const hihatSynth = new Tone.MetalSynth({
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
}).toDestination();

const bassSynth = new Tone.MonoSynth({
  oscillator: { type: 'square' },
  envelope: {
    attack: 0.01,
    decay: 0.3,
    sustain: 0.5,
    release: 0.8
  },
  filterEnvelope: {
    attack: 0.01,
    decay: 0.1,
    sustain: 0.4,
    release: 0.5,
    baseFrequency: 200,
    octaves: 2
  }
}).toDestination();

const leadSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sawtooth' },
  envelope: {
    attack: 0.01,
    decay: 0.1,
    sustain: 0.5,
    release: 0.4
  }
}).toDestination();

// Generate a simple celebration pattern
function generateCelebrationPattern() {
  return {
    tempo: DEFAULT_TEMPO,
    timeSignature: [4, 4],
    patterns: {
      kick: generatePattern('kick'),
      snare: generatePattern('snare'),
      hihat: generatePattern('hihat'),
      bass: generateBassPattern(),
      lead: generateLeadPattern()
    }
  };
}

// Helper functions to generate patterns
function generatePattern(type) {
  const pattern = [];
  const steps = DEFAULT_BARS * 4; // 4 beats per bar
  
  for (let i = 0; i < steps; i++) {
    if (type === 'kick' && i % 4 === 0) {
      pattern.push({ time: `0:0:${i}`, note: 'C1', duration: '16n', velocity: 0.9 });
    } else if (type === 'snare' && i % 8 === 4) {
      pattern.push({ time: `0:0:${i}`, note: 'D1', duration: '16n', velocity: 0.8 });
    } else if (type === 'hihat' && i % 2 === 0) {
      pattern.push({ time: `0:0:${i}`, note: 'F#1', duration: '32n', velocity: 0.7 });
    }
  }
  
  return pattern;
}

function generateBassPattern() {
  const pattern = [];
  const notes = ['C2', 'G2', 'A2', 'F2'];
  
  for (let i = 0; i < DEFAULT_BARS; i++) {
    pattern.push({
      time: `0:${i}:0`,
      note: notes[i % notes.length],
      duration: '4n',
      velocity: 0.8
    });
  }
  
  return pattern;
}

function generateLeadPattern() {
  const pattern = [];
  const notes = ['C4', 'E4', 'G4', 'A4', 'G4', 'E4'];
  
  for (let i = 0; i < notes.length; i++) {
    pattern.push({
      time: `0:${Math.floor(i/2)}:${(i%2) * 2}`,
      note: notes[i],
      duration: '8n',
      velocity: 0.7
    });
  }
  
  return pattern;
}

// Play the generated pattern
async function playPattern() {
  await Tone.start();
  Tone.Transport.bpm.value = DEFAULT_TEMPO;
  
  // Clear any existing scheduled events
  Tone.Transport.cancel();
  
  const pattern = generateCelebrationPattern();
  
  // Schedule all the patterns with their respective synths
  schedulePattern(kickSynth, pattern.patterns.kick);
  schedulePattern(snareSynth, pattern.patterns.snare);
  schedulePattern(hihatSynth, pattern.patterns.hihat);
  schedulePattern(bassSynth, pattern.patterns.bass);
  schedulePattern(leadSynth, pattern.patterns.lead);
  
  // Start playback
  Tone.Transport.start();
  
  // Return the pattern for display
  return pattern;
}

function schedulePattern(instrument, pattern) {
  pattern.forEach(event => {
    // Special case for noise-based instruments
    if (instrument === snareSynth || instrument === hihatSynth) {
      instrument.triggerAttackRelease(
        event.duration,
        event.time,
        event.velocity
      );
    } else {
      instrument.triggerAttackRelease(
        event.note,
        event.duration,
        event.time,
        event.velocity
      );
    }
  });
}

// Export for browser use
const phiMusic = {
  generateCelebrationPattern,
  playPattern,
  stop: () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }
};

// Make available globally for the HTML file
if (typeof window !== 'undefined') {
  window.phiMusic = phiMusic;
}

// For testing in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateCelebrationPattern,
    playPattern: () => console.log('Run this in a browser with Tone.js for audio')
  };
}
