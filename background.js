// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('HIIT Timer extension installed');
});

// Handle browser action click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup when the extension icon is clicked
  // The actual popup is defined in popup.html
});

// Request notification permission when needed
function requestNotificationPermission() {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
}

// Show desktop notification
function showNotification(title, message) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: 'icons/icon128.png'
    });
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SHOW_NOTIFICATION') {
    showNotification(request.title, request.message);
  }
  return true;
});

// Initialize notification permission on install
chrome.runtime.onInstalled.addListener(() => {
  requestNotificationPermission();
});
