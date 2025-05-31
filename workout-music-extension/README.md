# Workout Music Player Chrome Extension

A Chrome extension that provides dynamic workout music with adjustable BPM and intensity.

## Features

- Adjustable BPM (60-200)
- Intensity control (1-10)
- Multiple music styles (EDM, Rock)
- Saves your preferences
- Clean, responsive UI

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the `workout-music-extension` folder
5. Pin the extension to your toolbar for easy access

## Usage

1. Click the extension icon in your toolbar
2. Adjust the BPM to match your workout pace
3. Set the intensity level (1-10)
4. Choose a music style
5. Click "Start" to begin the music
6. Adjust settings on the fly during your workout

## Development

### File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main UI
- `css/styles.css` - Styling
- `js/` - JavaScript files
  - `AudioManager.js` - Handles audio playback
  - `UIManager.js` - Manages UI interactions
  - `workout-music.js` - Main application logic
  - `workout-music-presets.js` - Music style presets
  - `popup.js` - Extension popup logic
  - `background.js` - Background script
- `images/` - Extension icons

### Building

1. Make your changes to the source files
2. Test in Chrome by reloading the extension at `chrome://extensions/`

## License

MIT
