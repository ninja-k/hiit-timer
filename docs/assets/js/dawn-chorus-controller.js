// Dawn Chorus Controller
import { DawnChorusAudio } from './dawn-chorus-audio.js';
import { DawnChorusVisualizer } from './dawn-chorus-visual.js';

// Ensure Tone.js is loaded globally
import 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Create audio engine but don't initialize it yet
    const audioEngine = new DawnChorusAudio();
    
    // Get DOM elements
    const canvas = document.getElementById('visualizer');
    const playButton = document.getElementById('playButton');
    const stopButton = document.getElementById('stopButton');
    const statusDisplay = document.getElementById('status');
    const padsControl = document.getElementById('pads');
    const chimesControl = document.getElementById('chimes');
    const birdsControl = document.getElementById('birds');
    const timeDisplay = document.getElementById('timeDisplay');
    const sunElement = document.getElementById('sun');
    
    // State
    let isAudioInitialized = false;
    let isPlaying = false;
    
    // Function to handle user interaction
    async function handleUserInteraction() {
        if (isAudioInitialized) return true;
        
        try {
            statusDisplay.textContent = 'Initializing audio...';
            await audioEngine.init();
            isAudioInitialized = true;
            statusDisplay.textContent = 'Ready to begin...';
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            statusDisplay.textContent = 'Error initializing audio. Please try again.';
            return false;
        }
    }
    
    // Enable play button and handle initial interaction
    playButton.disabled = false;
    playButton.addEventListener('click', handlePlay);
    
    // Handle play button click
    async function handlePlay() {
        if (isPlaying) return;
        
        // Ensure audio is initialized
        if (!isAudioInitialized) {
            const success = await handleUserInteraction();
            if (!success) return;
        }
        
        try {
            isPlaying = true;
            playButton.disabled = true;
            stopButton.disabled = false;
            
            // Start audio and visualization
            await audioEngine.start();
            visualizer.start();
            
            // Start display updates
            updateDisplay();
            statusDisplay.textContent = 'Dawn is breaking...';
        } catch (error) {
            console.error('Error starting audio:', error);
            statusDisplay.textContent = 'Error starting audio. Please try again.';
            isPlaying = false;
            playButton.disabled = false;
            stopButton.disabled = true;
        }
    }
    
    // Initialize visualizer
    const visualizer = new DawnChorusVisualizer(canvas, audioEngine);
    let animationFrame = null;
    
    // Update control value displays with proper number validation
    function updateControlValues() {
        // Ensure values are numbers and within valid range [0, 1]
        const parseAndClamp = (value) => {
            const num = parseFloat(value);
            return isNaN(num) ? 0 : Math.max(0, Math.min(1, num));
        };

        const padsValue = parseAndClamp(padsControl.value);
        const chimesValue = parseAndClamp(chimesControl.value);
        const birdsValue = parseAndClamp(birdsControl.value);

        // Update display values
        document.getElementById('pads-value').textContent = `${Math.round(padsValue * 100)}%`;
        document.getElementById('chimes-value').textContent = `${Math.round(chimesValue * 100)}%`;
        document.getElementById('birds-value').textContent = `${Math.round(birdsValue * 100)}%`;
        
        // Update audio levels with validated values
        audioEngine.updateControls(padsValue, chimesValue, birdsValue);
    }
    
    // Update time display and status
    function updateDisplay() {
        if (!isPlaying) return;
        
        // Get time and status from visualizer
        const time = visualizer.getTimeOfDay();
        const status = visualizer.getStatusMessage();
        
        // Format time
        const displayHour = time.hour > 12 ? time.hour - 12 : time.hour;
        timeDisplay.textContent = `${displayHour}:${time.minute.toString().padStart(2, '0')} ${time.ampm}`;
        statusDisplay.textContent = status;
        
        // Update sun position based on progress
        const progress = audioEngine.getProgress();
        const sunY = 80 - (60 * progress); // Move from 80% to 20% of container height
        sunElement.style.bottom = `${sunY}%`;
        
        // Update background gradient based on time
        updateBackgroundGradient(progress);
        
        // Continue animation
        animationFrame = requestAnimationFrame(updateDisplay);
    }
    
    // Update background gradient based on time of day
    function updateBackgroundGradient(progress) {
        // Calculate colors based on progress (0 to 1)
        const hue = 220 - (progress * 60); // Blue (220) to warm (160)
        const saturation = 80 - (progress * 40); // More saturated at night
        const lightness = 10 + (progress * 30); // Darker at night
        
        // Update CSS variables
        document.documentElement.style.setProperty('--dawn-dark', `hsl(${hue}, ${saturation}%, ${lightness}%)`);
        document.documentElement.style.setProperty('--dawn-mid', `hsl(${hue - 20}, ${saturation}%, ${lightness + 10}%)`);
        document.documentElement.style.setProperty('--sun-color', `hsl(${40 + (progress * 20)}, 100%, 60%)`);
    }
    
    // Initialize audio context on first user interaction
    async function initializeAudio() {
        if (isAudioInitialized) return true;
        
        try {
            // Start the audio context
            await Tone.start();
            await Tone.loaded();
            
            // Create and connect the audio engine
            await audioEngine.init();
            
            isAudioInitialized = true;
            statusDisplay.textContent = 'Ready to begin...';
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            statusDisplay.textContent = 'Error initializing audio. Please refresh and try again.';
            return false;
        }
    }
    

    
    // Stop button click handler
    stopButton.addEventListener('click', async () => {
        if (!isPlaying) return;
        
        try {
            isPlaying = false;
            playButton.disabled = false;
            stopButton.disabled = true;
            
            // Stop audio and visualization
            try {
                await audioEngine.stop();
            } catch (e) {
                console.warn('Error in audio engine stop:', e);
                // Fallback: silence all synths manually
                if (audioEngine.padSynth?.volume) audioEngine.padSynth.volume.value = -Infinity;
                if (audioEngine.chimeSynth?.volume) audioEngine.chimeSynth.volume.value = -Infinity;
                if (audioEngine.birdSynth?.volume) audioEngine.birdSynth.volume.value = -Infinity;
                if (audioEngine.noise?.volume) audioEngine.noise.volume.value = -Infinity;
                
                // Stop transport
                if (Tone.Transport.state !== 'stopped') {
                    Tone.Transport.stop();
                    Tone.Transport.cancel();
                }
            }
            
            // Stop visualization
            if (visualizer && typeof visualizer.stop === 'function') {
                visualizer.stop();
            }
            
            // Update UI
            statusDisplay.textContent = 'Paused';
            
            // Reset time display if needed
            if (timeDisplay) {
                timeDisplay.textContent = 'Paused';
            }
        } catch (error) {
            console.error('Error stopping audio:', error);
            statusDisplay.textContent = 'Error stopping audio';
            isPlaying = true; // Reset state on error
            playButton.disabled = true;
            stopButton.disabled = false;
        }
        
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    });
    
    // Control change handlers
    [padsControl, chimesControl, birdsControl].forEach(control => {
        control.addEventListener('input', updateControlValues);
    });
    
    // Initialize control values
    updateControlValues();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        visualizer.setupCanvas();
    });
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        audioEngine.stop();
        visualizer.cleanup();
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    });
    
    // Enable play button after user interaction (required for autoplay policies)
    function enablePlayButton() {
        playButton.disabled = false;
        document.removeEventListener('click', enablePlayButton);
        document.removeEventListener('keydown', enablePlayButton);
    }
    
    // Enable play button on first user interaction
    document.addEventListener('click', enablePlayButton);
    document.addEventListener('keydown', enablePlayButton);
});
