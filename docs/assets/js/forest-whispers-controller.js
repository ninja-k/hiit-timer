// Forest Whispers Controller
import { forestAudio } from './forest-whispers-audio.js';
import { createForestVisual } from './forest-whispers-visual.js';

class ForestController {
    constructor() {
        this.audio = forestAudio;
        this.visual = null;
        this.isPlaying = false;
        this.dayNightProgress = 0;
        this.dayNightInterval = null;
    }

    async initialize() {
        // Initialize audio engine
        await this.audio.initialize();

        // Initialize visualization
        const container = document.querySelector('.visualizer-container');
        this.visual = createForestVisual(container);
        this.visual.initialize();

        // Set up UI controls
        this.setupControls();
    }

    setupControls() {
        // Get UI elements
        const playButton = document.getElementById('playButton');
        const stopButton = document.getElementById('stopButton');
        const canopyControl = document.getElementById('canopy');
        const understoryControl = document.getElementById('understory');
        const forestFloorControl = document.getElementById('forestFloor');
        const statusElement = document.getElementById('status');
        const timeDisplay = document.getElementById('timeDisplay');

        // Play button
        playButton.addEventListener('click', () => {
            if (!this.isPlaying) {
                this.start();
                playButton.disabled = true;
                stopButton.disabled = false;
                statusElement.textContent = 'The forest awakens...';
            }
        });

        // Stop button
        stopButton.addEventListener('click', () => {
            if (this.isPlaying) {
                this.stop();
                playButton.disabled = false;
                stopButton.disabled = true;
                statusElement.textContent = 'The forest returns to silence...';
            }
        });

        // Control knobs
        const updateControls = () => {
            const canopy = parseFloat(canopyControl.value);
            const understory = parseFloat(understoryControl.value);
            const forestFloor = parseFloat(forestFloorControl.value);

            // Update audio parameters
            this.audio.updateControls(canopy, understory, forestFloor);

            // Update display values
            document.getElementById('canopy-value').textContent = `${Math.round(canopy * 100)}%`;
            document.getElementById('understory-value').textContent = `${Math.round(understory * 100)}%`;
            document.getElementById('forestFloor-value').textContent = `${Math.round(forestFloor * 100)}%`;
        };

        canopyControl.addEventListener('input', updateControls);
        understoryControl.addEventListener('input', updateControls);
        forestFloorControl.addEventListener('input', updateControls);

        // Initial control update
        updateControls();
    }

    start() {
        if (this.isPlaying) return;

        // Start audio
        this.audio.start();

        // Start visualization
        this.visual.start();

        // Start day/night cycle
        this.startDayNightCycle();

        this.isPlaying = true;
    }

    stop() {
        if (!this.isPlaying) return;

        // Stop audio
        this.audio.stop();

        // Stop visualization
        this.visual.stop();

        // Stop day/night cycle
        this.stopDayNightCycle();

        this.isPlaying = false;
    }

    startDayNightCycle() {
        const CYCLE_DURATION = 300000; // 5 minutes per cycle
        const UPDATE_INTERVAL = 100; // Update every 100ms

        this.dayNightInterval = setInterval(() => {
            // Update progress (0-1)
            this.dayNightProgress = (this.dayNightProgress + (UPDATE_INTERVAL / CYCLE_DURATION)) % 1;

            // Update visualization
            this.visual.updateDayNightCycle(this.dayNightProgress);

            // Update time display
            this.updateTimeDisplay();
        }, UPDATE_INTERVAL);
    }

    stopDayNightCycle() {
        if (this.dayNightInterval) {
            clearInterval(this.dayNightInterval);
            this.dayNightInterval = null;
        }
    }

    updateTimeDisplay() {
        const timeDisplay = document.getElementById('timeDisplay');
        const hour = Math.floor(this.dayNightProgress * 24);
        const minute = Math.floor((this.dayNightProgress * 24 % 1) * 60);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        
        timeDisplay.textContent = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        
        // Update status message based on time
        const status = document.getElementById('status');
        status.textContent = this.getTimeBasedStatus(hour);
    }

    getTimeBasedStatus(hour) {
        if (hour >= 5 && hour < 8) return 'Dawn chorus begins...';
        if (hour >= 8 && hour < 12) return 'Morning activity in full swing...';
        if (hour >= 12 && hour < 15) return 'Peaceful afternoon rustling...';
        if (hour >= 15 && hour < 18) return 'The forest prepares for dusk...';
        if (hour >= 18 && hour < 21) return 'Evening songs fill the air...';
        return 'Night whispers through the trees...';
    }
}

// Create and export controller instance
export const forestController = new ForestController();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    forestController.initialize().catch(console.error);
});
