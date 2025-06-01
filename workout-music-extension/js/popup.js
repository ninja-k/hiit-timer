// Import required modules
import { UIManager } from './UIManager.js';
import { WorkoutMusic } from './workout-music.js';

// Global reference to the app and UI manager
window.app = null;
let uiManager = null;
let isInitializing = false;

// Function to update status message in the UI
function updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;
    
    // Clear all status classes
    statusEl.className = '';
    statusEl.classList.add(`status-${type}`);
    statusEl.textContent = message;
    
    // Add loading animation for info messages
    if (type === 'info') {
        statusEl.classList.add('loading');
    } else {
        statusEl.classList.remove('loading');
    }
}

// Function to set controls enabled/disabled state
function setControlsEnabled(enabled) {
    const controls = [
        document.getElementById('bpm'),
        document.getElementById('intensity'),
        document.getElementById('style'),
        document.getElementById('initBtn'),
        document.getElementById('startBtn'),
        document.getElementById('stopBtn')
    ];
    
    controls.forEach(control => {
        if (control) control.disabled = !enabled;
    });
}

// Initialize the UI and event listeners
function initializeUI() {
    // Initialize UI Manager
    uiManager = new UIManager();
    
    // Set up event listeners
    document.getElementById('initBtn')?.addEventListener('click', handleInit);
    document.getElementById('startBtn')?.addEventListener('click', handleStart);
    document.getElementById('stopBtn')?.addEventListener('click', handleStop);
    
    // Update initial UI state
    updateStatus('Ready to initialize', 'info');
    setControlsEnabled(true);
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;
}

// Event handlers
async function handleInit() {
    try {
        updateStatus('Initializing audio...', 'info');
        setControlsEnabled(false);
        
        // Initialize the app
        window.app = new WorkoutMusic();
        
        // Enable start button
        document.getElementById('startBtn').disabled = false;
        updateStatus('Ready to start', 'success');
        
    } catch (error) {
        console.error('Initialization error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
        setControlsEnabled(true);
    }
}

async function handleStart() {
    if (!window.app) return;
    
    try {
        await window.app.start();
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        updateStatus('Playing', 'success');
    } catch (error) {
        console.error('Start error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}

function handleStop() {
    if (!window.app) return;
    
    try {
        window.app.stop();
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        updateStatus('Stopped', 'info');
    } catch (error) {
        console.error('Stop error:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}

// Make functions available globally
window.updateStatus = updateStatus;
window.setControlsEnabled = setControlsEnabled;

// Function to initialize the app
async function initializeApp() {
    if (isInitializing) return false;
    isInitializing = true;
    
    try {
        updateStatus('Initializing audio engine...', 'info');
        setControlsEnabled(false);
        
        // Create and initialize the app
        app = new WorkoutMusic();
        
        // Load saved settings
        const settings = await new Promise(resolve => {
            chrome.storage.sync.get({
                bpm: 120,
                intensity: 5,
                style: 'edm'
            }, resolve);
        });
        
        // Update UI with saved values
        document.getElementById('bpm').value = settings.bpm;
        document.getElementById('bpm-value').textContent = settings.bpm;
        document.getElementById('intensity').value = settings.intensity;
        document.getElementById('intensity-value').textContent = settings.intensity;
        document.getElementById('style').value = settings.style;
        
        // Initialize audio context
        if (!app.audioManager.initialized) {
            const audioInitialized = await app.audioManager.initialize();
            if (!audioInitialized) {
                throw new Error('Failed to initialize audio context');
            }
        }
        
        // Set initial app state
        app.bpm = parseInt(settings.bpm);
        app.intensity = parseInt(settings.intensity);
        app.currentStyle = settings.style;
        window.currentStyle = settings.style;
        app.updatePattern();
        
        updateStatus('Ready', 'success');
        setControlsEnabled(true);
        return true;
        
    } catch (error) {
        console.error('Initialization error:', error);
        updateStatus(`Error: ${error.message || 'Failed to initialize'}`, 'error');
        setControlsEnabled(false);
        return false;
        
    } finally {
        isInitializing = false;
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize UI components first
        initializeUI();
        
        // Then initialize the app
        await initializeApp();
        
        // Enable controls if initialization was successful
        if (app && app.audioManager.initialized) {
            document.getElementById('startBtn').disabled = false;
            updateStatus('Ready to start', 'success');
        } else {
            updateStatus('Initialization failed', 'error');
        }
    } catch (error) {
        console.error('Failed to initialize:', error);
        updateStatus(`Error: ${error.message || 'Initialization failed'}`, 'error');
    }
    
    // Set up event listeners
    document.getElementById('bpm').addEventListener('input', async (e) => {
        const bpm = e.target.value;
        document.getElementById('bpm-value').textContent = bpm;
        
        if (!app) {
            await initializeApp();
        }
        
        if (app) {
            app.bpm = parseInt(bpm);
            app.updatePattern();
            await chrome.storage.sync.set({ bpm: parseInt(bpm) });
        }
    });

    document.getElementById('intensity').addEventListener('input', async (e) => {
        const intensity = e.target.value;
        document.getElementById('intensity-value').textContent = intensity;
        
        if (!app) {
            await initializeApp();
        }
        
        if (app) {
            app.intensity = parseInt(intensity);
            app.updatePattern();
            await chrome.storage.sync.set({ intensity: parseInt(intensity) });
        }
    });

    document.getElementById('style').addEventListener('change', async (e) => {
        const style = e.target.value;
        console.log('Style changed to:', style);
        
        if (!app) {
            await initializeApp();
        }
        
        if (app) {
            // Update the style in the app
            app.currentStyle = style;
            
            // Update the pattern with the new style
            app.updatePattern();
            
            // Save to storage
            await chrome.storage.sync.set({ style });
            
            // Update the window style reference
            window.currentStyle = style;
            console.log('Style change completed for:', style);
        }
    });
    
    // Set up play button (using startBtn and stopBtn instead of toggle-play)
    document.getElementById('startBtn').addEventListener('click', handleStart);
    document.getElementById('stopBtn').addEventListener('click', handleStop);
    
    // Initialize on any key press or click in case the button isn't the first interaction
    const initOnInteraction = () => {
        if (!app) {
            initializeApp().catch(console.error);
        }
    };
    document.addEventListener('click', initOnInteraction, { once: true });
    document.addEventListener('keydown', initOnInteraction, { once: true });
});
