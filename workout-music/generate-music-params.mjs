import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

async function generateMusicParams(description) {
    try {
        // Construct the prompt with clear instructions
        const prompt = `Generate music parameters in JSON format for: "${description}". \
The output should be a valid JSON object with these exact keys: {
    "key": "string (e.g., C, D, E, etc.)",
    "scale": "string (major/minor)",
    "tempo": number (60-180),
    "instruments": ["array", "of", "instruments"],
    "style": "string describing the style",
    "structure": "string describing the structure"
}.

Only output the JSON object, nothing else.`;

        // Call Ollama CLI directly
        const { stdout, stderr } = await execPromise(`ollama run phi '${prompt.replace(/'/g, "'")}'`);
        
        if (stderr) {
            console.error('Error from Ollama:', stderr);
            return null;
        }
        
        // Clean up the output
        const cleanedOutput = stdout
            .replace(/\x1b\[\d+[A-Za-z]/g, '')  // Remove ANSI escape codes
            .trim();
            
        // Try to find JSON in the output
        const jsonMatch = cleanedOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        console.log('Could not find JSON in output, returning raw output');
        return cleanedOutput;
        
    } catch (error) {
        console.error('Error generating music parameters:', error);
        return null;
    }
}

// Example usage
const description = "a birthday party for a 10-year-old with a space theme";
generateMusicParams(description)
    .then(params => {
        if (params) {
            console.log('Generated music parameters:');
            console.log(JSON.stringify(params, null, 2));
        } else {
            console.log('No parameters were generated');
        }
    });
