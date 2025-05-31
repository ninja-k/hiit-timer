import { WorkoutMusic } from './workout-music.js';
import { motivation } from './motivation.js';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing Workout Music App...');
        
        // Create and initialize the workout music player
        // The WorkoutMusic constructor handles the singleton pattern
        const workoutMusic = new WorkoutMusic();
        
        // Store it globally for debugging
        window.workoutMusic = workoutMusic;
        window.motivation = motivation;
        
        // Initialize motivation system
        motivation.initVoice();
        
        // Handle page visibility changes
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && workoutMusic.isPlaying) {
                console.log('Tab hidden - pausing audio');
                workoutMusic.stop();
            }
        };
        
        // Add visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Cleanup function
        const cleanup = () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (workoutMusic.isPlaying) {
                workoutMusic.stop();
            }
        };
        
        // Handle page unload
        window.addEventListener('beforeunload', cleanup);
        
        console.log('Workout Music App initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize Workout Music App:', error);
    }
});
