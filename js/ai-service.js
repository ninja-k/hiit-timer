class AIService {
    static async generate(prompt) {
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "gemma:2b",
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        num_ctx: 512,
                        num_predict: 100
                    }
                })
            });
            const data = await response.json();
            return data.response.trim();
        } catch (error) {
            console.error("AI Service Error:", error);
            return this.getFallbackMessage();
        }
    }

    static async getWorkoutTip() {
        const prompt = `Give a short, practical HIIT workout tip (max 10 words). 
        Focus on form, efficiency, or motivation. Example: "Keep your core engaged during planks".`;
        return await this.generate(prompt);
    }

    static async getExerciseSuggestion() {
        const prompt = `Suggest one HIIT exercise (just the name and 1-2 word description). 
        Example: "Burpees - Full body explosive" or "Mountain Climbers - Core focus"`;
        return await this.generate(prompt);
    }

    static async getMotivation() {
        const prompt = `Give a short, energetic workout motivation (max 5 words). 
        Example: "You've got this!" or "Push through the burn!"`;
        return await this.generate(prompt);
    }

    static getFallbackMessage() {
        const fallbacks = [
            "Keep pushing! You're doing great! 💪",
            "Stay focused and keep moving! 🏃",
            "You're stronger than you think! 💥",
            "One more rep! You've got this! 🔥",
            "The burn means it's working! Keep going! 🚀"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}
