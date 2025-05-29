// Happy Birthday Song Player using Tone.js

class HappyBirthdayPlayer {
    constructor() {
        this.synth = null;
        this.bassSynth = null;
        this.isPlaying = false;
        this.sequence = null;
        this.currentNote = 0;
        
        // Happy Birthday melody in C Major
        this.melody = [
            // Happy Birthday to you,
            { note: 'C4', duration: '4n', time: '0:0' },
            { note: 'C4', duration: '8n', time: '0:1' },
            { note: 'D4', duration: '4n', time: '0:1.5' },
            { note: 'C4', duration: '4n', time: '0:2.5' },
            { note: 'F4', duration: '4n', time: '0:3' },
            { note: 'E4', duration: '2n', time: '0:3.5' },
            
            // Happy Birthday to you,
            { note: 'C4', duration: '4n', time: '1:0' },
            { note: 'C4', duration: '8n', time: '1:1' },
            { note: 'D4', duration: '4n', time: '1:1.5' },
            { note: 'C4', duration: '4n', time: '1:2.5' },
            { note: 'G4', duration: '4n', time: '1:3' },
            { note: 'F4', duration: '2n', time: '1:3.5' },
            
            // Happy Birthday dear [name],
            { note: 'C4', duration: '4n', time: '2:0' },
            { note: 'C4', duration: '8n', time: '2:1' },
            { note: 'C5', duration: '4n', time: '2:1.5' },
            { note: 'A4', duration: '4n', time: '2:2.5' },
            { note: 'F4', duration: '4n', time: '2:3' },
            { note: 'E4', duration: '4n', time: '2:3.5' },
            { note: 'D4', duration: '2n', time: '2:4' },
            
            // Happy Birthday to you!
            { note: 'Bb4', duration: '4n', time: '3:0' },
            { note: 'Bb4', duration: '8n', time: '3:1' },
            { note: 'A4', duration: '4n', time: '3:1.5' },
            { note: 'F4', duration: '4n', time: '3:2.5' },
            { note: 'G4', duration: '4n', time: '3:3' },
            { note: 'F4', duration: '2n', time: '3:3.5' },
        ];
        
        // Simple chord progression for harmony
        this.chords = [
            { note: 'C3', time: '0:0', duration: '1m' },  // C
            { note: 'F3', time: '1:0', duration: '1m' },  // F
            { note: 'C3', time: '2:0', duration: '1m' },  // C
            { note: 'G3', time: '3:0', duration: '0.5m' }, // G
            { note: 'C3', time: '3:2', duration: '0.5m' }  // C
        ];
    }
    
    async init() {
        // Create audio context on user interaction
        await Tone.start();
        
        // Create synth for melody
        this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        this.synth.volume.value = -8; // Slightly lower volume
        
        // Create bass synth for chords
        this.bassSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: 'triangle'
            },
            envelope: {
                attack: 0.05,
                decay: 0.5,
                sustain: 0.3,
                release: 1
            }
        }).toDestination();
        this.bassSynth.volume.value = -12; // Lower volume for bass
        
        // Set the tempo to a comfortable singing speed
        Tone.Transport.bpm.value = 100;
    }
    
    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        // Schedule the melody
        this.melody.forEach(note => {
            this.synth.triggerAttackRelease(
                note.note,
                note.duration,
                note.time,
                0.7 // Velocity
            );
        });
        
        // Schedule the chords
        this.chords.forEach(chord => {
            this.bassSynth.triggerAttackRelease(
                chord.note,
                chord.duration,
                chord.time,
                0.5 // Velocity
            );
        });
        
        // Start playback
        Tone.Transport.start();
        
        // Stop after the song is done (4 measures)
        Tone.Transport.scheduleOnce(() => {
            this.stop();
        }, '4:0');
    }
    
    stop() {
        if (!this.isPlaying) return;
        
        Tone.Transport.stop();
        Tone.Transport.cancel();
        this.isPlaying = false;
    }
    
    // Set the name in the song (for the third line)
    setName(name) {
        // This is a placeholder - in a real app, you might want to 
        // adjust the timing of the third line based on name length
        console.log(`Happy Birthday to ${name}!`);
    }
}

// Initialize and set up UI when the page loads
window.addEventListener('load', () => {
    const player = new HappyBirthdayPlayer();
    
    // Set up play button
    document.getElementById('playBtn')?.addEventListener('click', async () => {
        if (!player.synth) {
            await player.init();
        }
        player.play();
    });
    
    // Set up stop button
    document.getElementById('stopBtn')?.addEventListener('click', () => {
        player.stop();
    });
    
    // Set name if name input exists
    const nameInput = document.getElementById('nameInput');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            player.setName(e.target.value);
        });
    }
});
