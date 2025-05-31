// Import the WorkoutMusic class
import { WorkoutMusic } from './workout-music.js';

// Wait for Tone.js to be ready
async function waitForTone() {
  if (window.Tone?.loaded) {
    return true;
  }
  
  return new Promise((resolve) => {
    const checkTone = setInterval(() => {
      if (window.Tone?.loaded) {
        clearInterval(checkTone);
        resolve(true);
      }
    }, 100);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkTone);
      resolve(false);
    }, 5000);
  });
}

// Main initialization function
async function initializeApp() {
  try {
    // Update status
    if (window.updateStatus) {
      window.updateStatus('Initializing audio engine...', 'info');
    }
    
    // Wait for Tone.js to be ready
    const toneReady = await waitForTone();
    if (!toneReady) {
      throw new Error('Timed out waiting for Tone.js to load');
    }
    
    // Load the main app module
    const { WorkoutMusic } = await import('./workout-music.js');
    
    // Initialize the app
    window.app = new WorkoutMusic();
    
    // Update UI
    if (window.updateStatus && window.setControlsEnabled) {
      window.updateStatus('Ready', 'success');
      window.setControlsEnabled(true);
    }
    
  } catch (error) {
    console.error('Initialization error:', error);
    if (window.updateStatus) {
      window.updateStatus(`Error: ${error.message || 'Failed to initialize'}`, 'error');
    }
    if (window.setControlsEnabled) {
      window.setControlsEnabled(false);
    }
  }
}

// Start the initialization when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
