# HIIT Timer Extension

A customizable HIIT (High-Intensity Interval Training) timer for your browser. Perfect for Tabata, circuit training, and other interval workouts.

## Features

- 🕒 Customizable work and rest intervals
- 🔄 Multiple rounds support
- 🔊 Audio cues for phase changes
- 📊 Visual progress indicator
- 🎨 Clean, responsive interface
- 💾 Saves your last used settings

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the `hiit-timer` directory

## Usage

1. Click the HIIT Timer extension icon in your toolbar
2. Set your desired work time, rest time, and number of rounds
3. Click "Start" to begin your workout
4. The timer will automatically alternate between work and rest periods
5. Use the "Stop" button to pause or reset the timer

## Customization

- **Work Time**: Set from 5 to 600 seconds (10 minutes)
- **Rest Time**: Set from 0 to 300 seconds (5 minutes)
- **Rounds**: Set from 1 to 50 rounds

## Audio Cues

- **Start/Stop**: Single beep
- **Phase Change**: Double beep (work to rest and vice versa)
- **Countdown**: Beeps during the last 3 seconds of each phase
- **Workout Complete**: Triple beep

## Browser Support

- Chrome (latest version)
- Edge (latest version)
- Other Chromium-based browsers

## Development

1. Make your changes to the source files
2. Test your changes by reloading the extension in `chrome://extensions/`
3. When ready, create a production build

## License

This project is open source and available under the [MIT License](LICENSE).
