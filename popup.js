// DOM Elements
const timerDisplay = document.getElementById('timerDisplay');
const phaseDisplay = document.getElementById('phaseDisplay');
const progressBar = document.getElementById('progressBar');
const roundsDisplay = document.getElementById('roundsDisplay');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const workTimeInput = document.getElementById('workTime');
const restTimeInput = document.getElementById('restTime');
const roundsInput = document.getElementById('rounds');

// Audio Context and Sounds
let audioContext;
let beepSound;

// Timer state
let timer = null;
let timeLeft = 0;
let totalTime = 0;
let isWorkPhase = true;
let currentRound = 0;
let totalRounds = 0;
let isRunning = false;

// Initialize audio
function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create a simple beep sound
  function createBeep(vol, freq, duration) {
    const v = audioContext.createOscillator();
    const u = audioContext.createGain();
    v.connect(u);
    v.frequency.value = freq;
    v.type = 'square';
    u.connect(audioContext.destination);
    u.gain.value = vol * 0.01;
    v.start();
    v.stop(audioContext.currentTime + duration * 0.001);
  }
  
  beepSound = (volume = 100, frequency = 800, duration = 200) => {
    createBeep(volume, frequency, duration);
  };
}

// Format time from seconds to MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update the display
function updateDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  progressBar.style.width = `${Math.min(100, progress)}%`;
  
  if (isRunning) {
    phaseDisplay.textContent = isWorkPhase ? 'WORK!' : 'REST';
    phaseDisplay.style.color = isWorkPhase ? '#e74c3c' : '#2ecc71';
    progressBar.style.background = isWorkPhase ? '#e74c3c' : '#2ecc71';
  }
  
  roundsDisplay.textContent = `Round ${currentRound}/${totalRounds}`;
}

// Play sound based on time left
function playTimeSounds() {
  if (timeLeft <= 3 && timeLeft > 0) {
    beepSound();
  }
}

// Timer tick
function tick() {
  if (timeLeft <= 0) {
    // Phase completed
    if (isWorkPhase) {
      // Switch to rest phase
      isWorkPhase = false;
      timeLeft = parseInt(restTimeInput.value);
      totalTime = timeLeft;
      playSound('phase_end');
    } else {
      // Switch to work phase
      currentRound++;
      if (currentRound > totalRounds) {
        // All rounds completed
        stopTimer();
        playSound('complete');
        phaseDisplay.textContent = 'Complete!';
        phaseDisplay.style.color = '#3498db';
        return;
      }
      isWorkPhase = true;
      timeLeft = parseInt(workTimeInput.value);
      totalTime = timeLeft;
      playSound('phase_start');
    }
    updateDisplay();
  } else {
    timeLeft--;
    playTimeSounds();
  }
  
  updateDisplay();
}

// Play different sounds
function playSound(type) {
  switch (type) {
    case 'start':
      beepSound(100, 1000, 300);
      break;
    case 'stop':
      beepSound(100, 500, 200);
      break;
    case 'phase_start':
      beepSound(100, 1200, 100);
      beepSound(100, 1400, 100);
      break;
    case 'phase_end':
      beepSound(100, 1400, 100);
      beepSound(100, 1200, 100);
      break;
    case 'complete':
      beepSound(100, 1000, 100);
      beepSound(100, 1200, 100);
      beepSound(100, 1400, 300);
      break;
  }
}

// Start the timer
function startTimer() {
  if (isRunning) return;
  
  // Initialize audio on first interaction
  if (!audioContext) {
    initAudio();
  }
  
  if (currentRound === 0) {
    // First start
    currentRound = 1;
    totalRounds = parseInt(roundsInput.value);
    workTime = parseInt(workTimeInput.value);
    restTime = parseInt(restTimeInput.value);
    
    timeLeft = workTime;
    totalTime = workTime;
    isWorkPhase = true;
  }
  
  isRunning = true;
  startBtn.style.display = 'none';
  stopBtn.style.display = 'inline-block';
  
  // Disable inputs while running
  workTimeInput.disabled = true;
  restTimeInput.disabled = true;
  roundsInput.disabled = true;
  
  playSound('start');
  updateDisplay();
  
  // Start the timer
  timer = setInterval(tick, 1000);
}

// Stop the timer
function stopTimer(reset = false) {
  if (!isRunning && !reset) return;
  
  clearInterval(timer);
  isRunning = false;
  
  if (reset) {
    // Reset all values
    currentRound = 0;
    timeLeft = parseInt(workTimeInput.value);
    totalTime = timeLeft;
    isWorkPhase = true;
    updateDisplay();
    phaseDisplay.textContent = 'Paused';
    phaseDisplay.style.color = '#7f8c8d';
  } else {
    playSound('stop');
  }
  
  startBtn.style.display = 'inline-block';
  stopBtn.style.display = 'none';
  
  // Re-enable inputs
  workTimeInput.disabled = false;
  restTimeInput.disabled = false;
  roundsInput.disabled = false;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Set initial values
  timeLeft = parseInt(workTimeInput.value);
  totalTime = timeLeft;
  updateDisplay();
  
  // Button events
  startBtn.addEventListener('click', startTimer);
  stopBtn.addEventListener('click', () => stopTimer(false));
  
  // Input validation
  [workTimeInput, restTimeInput, roundsInput].forEach(input => {
    input.addEventListener('change', () => {
      let value = parseInt(input.value);
      const min = parseInt(input.min) || 1;
      const max = parseInt(input.max) || 100;
      
      if (isNaN(value) || value < min) value = min;
      if (value > max) value = max;
      
      input.value = value;
      
      // Update timer display if not running
      if (!isRunning) {
        timeLeft = parseInt(workTimeInput.value);
        totalTime = timeLeft;
        updateDisplay();
      }
    });
  });
});

// Handle tab visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && isRunning) {
    // Pause timer when tab is hidden
    stopTimer(false);
  }
});
