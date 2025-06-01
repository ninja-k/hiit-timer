// Motivational System for Workout App
class MotivationSystem {
    constructor() {
        console.log('[Motivation] Initializing motivation system...');
        this.phrases = {
            warmup: [
                "Let's warm up those muscles!",
                "Start slow, focus on your form",
                "Ease into it, we're just getting started",
                "Nice and easy to begin with"
            ],
            work: [
                "Push through! You've got this!",
                "Feel the burn! That's progress!",
                "You're stronger than you think!",
                "This is where champions are made!",
                "Dig deep, you can do this!",
                "Your body can handle more than you think!",
                "Stay strong, stay focused!"
            ],
            rest: [
                "Great job! Breathe deeply.",
                "Recover well, you're doing amazing!",
                "Get ready for the next round!",
                "Stay focused, you're killing it!",
                "Nice work! Catch your breath.",
                "You're making progress every second!"
            ],
            halfway: [
                "You're halfway there! Keep pushing!",
                "50% done! You're crushing it!",
                "Halfway point! You've got this!"
            ],
            final: [
                "Final push! Give it everything!",
                "Last round! Make it count!",
                "Finish strong! You're almost there!"
            ],
            finish: [
                "Incredible work! You're unstoppable!",
                "You just crushed that workout!",
                "That's how it's done! Amazing job!",
                "Workout complete! You're a champion!"
            ],
            music_intensity: [
                "Feel the rhythm push you harder!",
                "Let the beat drive your movements!",
                "Sync your movements to the tempo!"
            ],
            music_transition: [
                "Changing the vibe for the next round!",
                "New energy coming your way!",
                "Shifting gears with the music!"
            ]
        };
        
        this.voice = null;
        this.initialized = false;
        this.voices = [];
        this.voiceLoadAttempts = 0;
        this.audioContext = null;
        
        console.log('[Motivation] Setting up voice synthesis...');
        // Wait for voices to be loaded
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.initVoice();
        }
        
        // Initial voice load attempt
        this.initVoice();
    }
    
    async initVoice() {
        try {
            // First cancel any ongoing speech
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            
            // Get available voices
            this.voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
            
            // If no voices, try to populate the voices array
            if (this.voices.length === 0) {
                console.log('No voices found, waiting for voiceschanged event...');
                
                // Return a promise that resolves when voices are loaded
                return new Promise((resolve) => {
                    const onVoicesChanged = () => {
                        this.voices = window.speechSynthesis.getVoices();
                        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
                        resolve();
                    };
                    
                    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
                    
                    // Set a timeout in case the event never fires
                    setTimeout(() => {
                        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
                        resolve();
                    }, 2000);
                });
            }
            
            // Try to find a preferred voice
            let voice = this.voices.find(v => 
                v.lang.startsWith('en-') && 
                (v.name.toLowerCase().includes('samantha') || 
                 v.name.toLowerCase().includes('victoria') ||
                 v.name.toLowerCase().includes('female') ||
                 v.name.toLowerCase().includes('daniel') ||   
                 v.name.toLowerCase().includes('alex'))       
            );
            
            // Fallback to any English voice with good quality
            if (!voice) {
                voice = this.voices.find(v => v.lang.startsWith('en-'));
            }
            
            if (voice) {
                this.voice = voice;
                console.log(`Selected voice: ${voice.name}`);
            } else {
                console.warn('No suitable voice found');
            }
            
            this.initialized = true;
            this.voiceLoadAttempts = 0;
        } catch (error) {
            console.error('Error initializing voice:', error);
            this.voiceLoadAttempts++;
            
            // Retry if we haven't exceeded max attempts
            if (this.voiceLoadAttempts < 3) {
                console.log(`Retrying voice initialization (attempt ${this.voiceLoadAttempts})...`);
                setTimeout(() => this.initVoice(), 1000);
            } else {
                console.error('Max voice initialization attempts exceeded');
            }
        }
    }
    
    async speak(type, customText = null) {
        try {
            let textToSpeak = customText || this.getRandomPhrase(type) || 'No message';
            console.log(`Speaking (${type}):`, textToSpeak);
            return this._speakWithSynthesis(type, customText);
        } catch (error) {
            console.error('Error in speak method:', error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }
    
    async _speakWithSynthesis(type, customText = null) {
        try {
            if (!window.speechSynthesis) {
                console.warn('Speech synthesis not supported in this browser');
                return Promise.resolve();
            }

            // Ensure we have voices loaded
            if (!this.voice && this.voices.length === 0) {
                console.log('No voices available, attempting to load...');
                await this.initVoice();
                
                // If still no voices after reload, give up
                if (this.voices.length === 0) {
                    console.warn('No voices available for speech synthesis');
                    return Promise.resolve();
                }
            }

            // Handle case where type is not provided or invalid
            if (!type || typeof type !== 'string') {
                console.warn('Invalid message type:', type);
                type = 'info'; // Default to 'info' type
            }

            // Get the text to speak
            const text = customText || this.getRandomPhrase(type) || 'No message';
            console.log(`Attempting to speak: "${text}"`);

            // Create a new speech synthesis request
            const msg = new SpeechSynthesisUtterance(text);
            
            // Set voice if available, otherwise use first available voice
            if (this.voice) {
                msg.voice = this.voice;
            } else if (this.voices.length > 0) {
                msg.voice = this.voices[0];
                console.log('Using default voice:', msg.voice.name);
            }
            
            // Set voice properties based on message type
            switch(type) {
                case 'work':
                    msg.rate = 1.1;     // Slightly faster for intensity
                    msg.pitch = 1.2;    // Higher pitch for energy
                    msg.volume = 1.0;   // Full volume when enabled
                    break;
                case 'rest':
                    msg.rate = 0.95;    // Slightly slower for recovery
                    msg.pitch = 1.0;    // Normal pitch
                    msg.volume = 0.95;   // Slightly quieter
                    break;
                case 'warmup':
                    msg.rate = 1.0;     // Normal pace
                    msg.pitch = 1.15;    // Slightly higher pitch
                    msg.volume = 1.0;    // Full volume when enabled
                    break;
                case 'finish':
                    msg.rate = 1.15;    // Energetic pace
                    msg.pitch = 1.25;    // Higher pitch for celebration
                    msg.volume = 1.0;    // Full volume when enabled
                    break;
                case 'halfway':
                case 'final':
                    msg.rate = 1.15;    // Energetic pace
                    msg.pitch = 1.2;     // Higher pitch for motivation
                    msg.volume = 1.0;    // Full volume when enabled
                    break;
                case 'info':
                default:
                    msg.rate = 1.0;     // Normal pace
                    msg.pitch = 1.0;     // Normal pitch
                    msg.volume = 1.0;    // Full volume when enabled
            }
            
            console.log(`[Speaking (${type})]:`, msg.text);
            
            // Return a promise that resolves when speech is done
            return new Promise((resolve, reject) => {
                msg.onend = resolve;
                msg.onerror = (event) => {
                    console.error('Speech synthesis error:', event);
                    // Fallback to playing a musical cue instead
                    this.playMusicalCue('error_fallback');
                    reject(event);
                };
                speechSynthesis.speak(msg);
            });
        } catch (error) {
            console.error('Error in speech synthesis:', error);
            return Promise.reject(error);
        }
    }
    
    getRandomPhrase(phase) {
        const phasePhrases = this.phrases[phase];
        if (!phasePhrases || phasePhrases.length === 0) {
            console.warn(`No phrases found for phase: ${phase}`);
            return null;
        }
        return phasePhrases[Math.floor(Math.random() * phasePhrases.length)];
    }
    
    playMusicalCue(type) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Create an oscillator
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Set the oscillator frequency based on the type
        if (type === 'error_fallback') {
            oscillator.frequency.value = 300; // low beep
        } else {
            oscillator.frequency.value = 800; // default beep
        }

        // Configure the sound
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1; // low volume

        // Start and stop the oscillator
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3); // beep for 0.3 seconds

        console.log(`Playing musical cue for ${type}`);
    }
}

// Create the motivation instance
const motivation = new MotivationSystem();

// Export for both ES modules and browser environment
export { motivation };
if (typeof window !== 'undefined') {
    window.motivation = motivation;
}
