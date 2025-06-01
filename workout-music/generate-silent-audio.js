const fs = require('fs');
const path = require('path');

// Create silent audio buffer (100ms of silence at 44.1kHz)
function createSilentAudio() {
    const arrayBuffer = new ArrayBuffer(44 + 8820); // 44-byte WAV header + 100ms of 16-bit audio at 44.1kHz
    const view = new DataView(arrayBuffer);
    
    // Write WAV header
    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 32 + 8820, true); // File size - 8
    writeString(view, 8, 'WAVE');
    
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true);  // NumChannels (1 = mono)
    view.setUint32(24, 44100, true); // SampleRate
    view.setUint32(28, 44100 * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true);  // BlockAlign (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // BitsPerSample
    
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, 8820, true); // Subchunk2Size (numSamples * NumChannels * BitsPerSample/8)
    
    return arrayBuffer;
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Create sounds directory if it doesn't exist
const soundsDir = path.join(__dirname, 'sounds');
if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
}

// Generate silent audio files
const silentAudio = createSilentAudio();
const soundFiles = ['kick.mp3', 'snare.mp3', 'hihat.mp3'];

soundFiles.forEach(file => {
    const filePath = path.join(soundsDir, file);
    fs.writeFileSync(filePath, Buffer.from(silentAudio));
    console.log(`Created: ${filePath}`);
});

console.log('Silent audio files generated successfully!');
