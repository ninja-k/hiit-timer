// Musical patterns for Workout Music Generator
export const patterns = {
    // Drum patterns (0 = rest, 1 = hit)
    drums: {
        edm: {
            kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1]
        },
        rock: {
            kick:  [1,0,0,0, 0,0,1,0, 0,1,0,0, 0,0,1,0],
            snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0]
        },
        hiphop: {
            kick:  [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,1],
            snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1]
        },
        lofi: {
            kick:  [1,0,0,1, 0,0,0,0, 1,0,0,0, 0,0,1,0],
            snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1]
        }
    },
    
    // Chord progressions (in C major for simplicity)
    // All chords must include an octave number (e.g., 'C4')
    chords: {
        edm: ["C3 E3 G3", "G3 B3 D4", "A3 C4 E4", "F3 A3 C4"],  // Full chord voicings
        rock: ["C3 G3 E4", "G3 D4 B4", "A3 E4 C5", "F3 C4 A4"],      // Power chord style
        hiphop: ["C3 G3", "G3 D4", "A3 E4", "F3 C4"],               // Simple two-note chords
        lofi: ["C3 E3 G3 B3", "E3 G3 B3 D4", "A3 C4 E4 G4", "F3 A3 C4 E4"]  // Extended chords
    },
    
    // Bass patterns (relative to chord roots)
    bass: {
        edm: [0, 0, 0, 0, 7, 7, 7, 7],
        rock: [0, 5, 7, 5],
        hiphop: [0, 0, 0, 0, 5, 5, 5, 5],
        lofi: [0, 0, 7, 7, 5, 5, 3, 3]
    },
    
    // Melody patterns (relative to chord tones)
    melody: {
        edm: [0, 2, 4, 7, 4, 2, 0, 2],
        rock: [0, 2, 4, 2, 0, -3, -5, -3],
        hiphop: [0, 0, 0, 0, 7, 7, 7, 7],
        lofi: [0, 2, 4, 5, 4, 2, 0, -1]
    }
};

// Get a pattern by style and type
export function getPattern(style, type, intensity = 5) {
    // Get the base pattern or return an empty array if not found
    const basePattern = patterns[type]?.[style];
    if (!basePattern) {
        console.warn(`No pattern found for type: ${type}, style: ${style}`);
        return [];
    }
    
    // For drums, create an adjusted pattern based on intensity
    if (type === 'drums') {
        const intensityFactor = Math.max(0.1, Math.min(1, intensity / 10));
        const adjusted = {};
        
        for (const [drum, pattern] of Object.entries(basePattern)) {
            adjusted[drum] = pattern.map(hit => 
                hit * (Math.random() < (0.5 + intensityFactor * 0.5) ? 1 : 0)
            );
        }
        return adjusted;
    }
    
    // For chords, return the pattern as-is (don't modify chord voicings)
    if (type === 'chords') {
        return [...basePattern]; // Return a copy to prevent modification
    }
    
    // For melody and bass patterns, apply intensity-based adjustments
    const intensityFactor = Math.max(0.1, Math.min(1, intensity / 10));
    return basePattern.map((note, i) => {
        // Only apply randomness to numeric values (bass and melody patterns)
        if (typeof note === 'number' && Math.random() < intensityFactor * 0.3) {
            return note + Math.floor(Math.random() * 3) - 1;
        }
        return note;
    });
}
