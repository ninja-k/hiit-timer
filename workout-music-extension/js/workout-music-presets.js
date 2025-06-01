// Style presets for WorkoutMusic

export const stylePresets = {
    edm: {
        name: 'EDM',
        instruments: ['kick', 'snare', 'hihat', 'clap'],
        pattern: [
            [1, 0, 0, 1],  // kick, snare, hihat, clap
            [0, 0, 1, 0],
            [1, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 0, 0, 1],
            [0, 0, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 1, 1]
        ],
        bpmRange: { min: 120, max: 150 },
        intensityMultiplier: 1.5,
        swing: 0.1,
        effects: {
            reverb: 0.2,
            delay: 0.1
        }
    },
    rock: {
        name: 'Rock',
        instruments: ['kick', 'snare', 'hihat', 'clap'],
        pattern: [
            [1, 0, 0, 0],  // kick, snare, hihat, clap
            [0, 0, 1, 0],
            [0, 0, 0, 1],
            [0, 1, 1, 0],
            [1, 0, 0, 0],
            [0, 0, 1, 0],
            [1, 0, 0, 1],
            [0, 1, 1, 0]
        ],
        bpmRange: { min: 100, max: 140 },
        intensityMultiplier: 1.8,
        swing: 0.1,
        effects: {
            reverb: 0.2,
            delay: 0.1
        }
    },
    hiphop: {
        name: 'Hip Hop',
        instruments: ['kick', 'snare', 'hihat', 'clap'],
        pattern: [
            [1, 0, 0, 1],  // kick, snare, hihat, clap
            [0, 0, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 1],
            [1, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 1, 0, 1],
            [0, 0, 1, 0]
        ],
        bpmRange: { min: 80, max: 110 },
        intensityMultiplier: 1.6,
        swing: 0.25,
        effects: {
            reverb: 0.15,
            delay: 0.2
        }
    }
};
