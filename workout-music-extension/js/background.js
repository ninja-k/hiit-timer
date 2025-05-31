// Background script for the Workout Music Player extension

// Simple initialization
console.log('Background script loaded');

// Set default settings when extension is installed
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed/updated:', details.reason);
    
    // Set default values if they don't exist
    chrome.storage.sync.get(['bpm', 'intensity', 'style'], (result) => {
        const defaults = {
            bpm: result.bpm || 120,
            intensity: result.intensity || 5,
            style: result.style || 'edm'
        };
        
        chrome.storage.sync.set(defaults, () => {
            console.log('Default settings saved:', defaults);
        });
    });
});

// Simple message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request);
    
    if (request.type === 'PING') {
        sendResponse({ status: 'ALIVE' });
    }
    
    // Return true to indicate we'll send a response asynchronously
    return true;
});

// Log any errors from the extension
chrome.runtime.onError.addListener((error) => {
    console.error('Extension error:', error);
});
