// This script generates placeholder icons for the extension
// You can replace these with proper icons later

const fs = require('fs');
const { createCanvas } = require('canvas');

// Create images directory if it doesn't exist
if (!fs.existsSync('images')) {
    fs.mkdirSync('images');
}

// Function to create an icon with the given size
function createIcon(size, filename) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#4285f4');
    gradient.addColorStop(1, '#34a853');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Draw music note
    ctx.fillStyle = 'white';
    const noteSize = size * 0.6;
    const noteX = (size - noteSize) / 2;
    const noteY = (size - noteSize) / 2;
    
    // Simple music note shape
    ctx.beginPath();
    ctx.arc(noteX + noteSize * 0.7, noteY + noteSize * 0.3, noteSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`images/${filename}`, buffer);
}

// Generate icons in different sizes
createIcon(16, 'icon16.png');
createIcon(48, 'icon48.png');
createIcon(128, 'icon128.png');

console.log('Icons generated successfully!');
