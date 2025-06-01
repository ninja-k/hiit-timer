// Style presets for WorkoutMusic

export const stylePresets = {
    edm: {
        name: 'EDM',
        instruments: ['kick', 'snare', 'hihat', 'bass', 'chords', 'lead'],
        pattern: [
            [1, 0, 1, 1, 1, 0], [0, 0, 1, 0, 0, 0], [0, 0, 1, 1, 0, 0], [1, 0, 1, 0, 0, 1],
            [1, 1, 1, 0, 0, 0], [0, 0, 1, 1, 0, 0], [1, 0, 1, 0, 1, 0], [0, 1, 1, 1, 0, 0]
        ],
        chordProgressions: [
            [
                ['C3', 'E3', 'G3'], ['G3', 'B3', 'D4'],
                ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']
            ],
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
        intensityMultiplier: 2.0,  // Increased from 1.6 for more dramatic effect
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
            [1, 0, 0, 1, 1, 0], [0, 0, 1, 0, 0, 0], [0, 1, 0, 0, 0, 0], [0, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0], [1, 1, 0, 1, 0, 1], [0, 0, 1, 0, 0, 0],
            [1, 0, 0, 1, 1, 0], [0, 0, 1, 0, 0, 0], [0, 1, 0, 0, 0, 0], [0, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0], [1, 1, 0, 1, 0, 1], [0, 0, 1, 0, 1, 0]
        ],
        chordProgressions: [
            [
                ['E3', 'G#3', 'B3'], ['B3', 'D#4', 'F#4'],
                ['C#4', 'E4', 'G#4'], ['A3', 'C#4', 'E4']
            ],
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
        intensityMultiplier: 1.8,  // Increased from 1.2 for more dramatic effect
        swing: 0.1,
        effects: {
            reverb: 0.4,
            delay: 0.1,
            distortion: 0.2
        }
    },
    hiphop: {
        name: 'Hip Hop',
        instruments: ['kick', 'snare', 'hihat', 'bass', 'chords', 'fx'],
        pattern: [
            [1, 0, 1, 1, 1, 0], [0, 0, 1, 0, 0, 0], [0, 1, 0, 0, 0, 0], [1, 0, 1, 0, 0, 1],
            [0, 0, 1, 1, 0, 0], [1, 0, 1, 0, 0, 0], [0, 1, 0, 0, 1, 0], [0, 0, 1, 0, 0, 1],
            [1, 0, 1, 1, 1, 0], [0, 0, 1, 0, 0, 0], [0, 1, 0, 0, 0, 0], [1, 0, 1, 0, 0, 1],
            [0, 0, 1, 1, 0, 0], [1, 0, 1, 0, 0, 0], [0, 1, 0, 0, 1, 0], [0, 0, 1, 0, 0, 1]
        ],
        chordProgressions: [
            [
                ['F#3', 'A3', 'C#4'], ['E3', 'G#3', 'B3'],
                ['C#3', 'E3', 'G#3'], ['D#3', 'F#3', 'A#3']
            ],
            [
                ['F#3', 'A3', 'C#4'], ['B3', 'D#4', 'F#4'],
                ['C#4', 'E4', 'G#4'], ['E3', 'G#3', 'B3']
            ]
        ],
        bassNotes: ['F#1', 'E1', 'C#2', 'D#2'],
        bassSlides: [
            { from: 'F#1', to: 'C#2', duration: 0.3 },
            { from: 'E1', to: 'G#1', duration: 0.2 }
        ],
        fxPattern: [
            'vinyl_scratch', 'snare_roll', 'riser', 'gun_cock',
            'siren', 'synth_hit', 'vocal_hit', 'drum_fill'
        ],
        vocalSamples: [
            { phrase: "Yeah!", position: 2 },
            { phrase: "Hey!", position: 6 },
            { phrase: "Drop!", position: 12 }
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
