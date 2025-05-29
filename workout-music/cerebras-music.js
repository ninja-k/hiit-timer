// music-generator.js
// Local music pattern generator using Phi

import { PhiClient } from '@microsoft/phi-node';
import * as Tone from 'tone';

// Initialize Phi client
const phi = new PhiClient();

// Music generation settings
const DEFAULT_TEMPO = 128;
const DEFAULT_BARS = 8;

async function callCerebrasAPI(messages) {
  try {
    console.log('Sending request to:', CEREBRAS_API_URL);
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.substring(0, 5)}...` // Show first 5 chars for security
    });

    const requestBody = {
      model: 'llama-4-scout-17b-16e-instruct',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(CEREBRAS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    try {
      // Try to parse as JSON first
      const responseData = JSON.parse(responseText);
      
      if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${responseData.error?.message || response.statusText}`);
      }
      
      return responseData;
    } catch (jsonError) {
      // If not JSON, log the raw response
      console.error('Failed to parse JSON response. Raw response:', responseText);
      if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${response.statusText}\nResponse: ${responseText.substring(0, 500)}`);
      }
      throw new Error(`Invalid JSON response: ${jsonError.message}\nResponse: ${responseText.substring(0, 500)}`);
    }
  } catch (error) {
    console.error('API Request Failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Generates music patterns using Cerebras API
 * @param {string} style - Musical style (e.g., 'electronic', 'jazz', 'classical')
 * @param {number} tempo - BPM (beats per minute)
 * @param {number} bars - Number of bars to generate
 * @returns {Promise<Object>} Generated music pattern in JSON format
 */
async function generateMusicPattern(style = 'electronic', tempo = 128, bars = 8) {
  try {
    const prompt = `Generate a JSON structure for a ${style} music composition with the following specifications:
    - Tempo: ${tempo} BPM
    - Length: ${bars} bars
    - Include patterns for: kick, snare, hihat, bass, and lead
    - Format: Return ONLY the JSON object without any markdown formatting or additional text
    - Structure the output with separate patterns for each instrument
    - Use note values (e.g., 'C4', 'D#3') for melodic parts
    - Use 1/16th note grid for timing
    - Include velocity information (0-1)
    - Example format for patterns:
      {
        "tempo": 128,
        "timeSignature": [4, 4],
        "patterns": {
          "kick": [
            { "time": "0:0:0", "note": "C1", "duration": "16n", "velocity": 0.9 },
            { "time": "0:2:0", "note": "C1", "duration": "16n", "velocity": 0.9 }
          ]
        }
      }`;

    console.log('Sending request to Cerebras API...');
    const response = await callCerebrasAPI([
      { 
        role: 'system', 
        content: 'You are a music composition assistant. Generate structured JSON music patterns.' 
      },
      { 
        role: 'user', 
        content: prompt 
      }
    ]);

    // Extract and parse the JSON from the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    
    const musicData = JSON.parse(jsonString);
    return musicData;
  } catch (error) {
    console.error('Error generating music pattern:', error);
    throw error;
  }
}

/**
 * Main function to generate and optionally play music
 */
async function main() {
  try {
    if (!apiKey) {
      throw new Error('No API key provided. Please set CEREBRAS_API_KEY environment variable or pass it as an argument.');
    }

    console.log('Generating music pattern...');
    const musicPattern = await generateMusicPattern('electronic', 128, 8);
    
    // Save the generated pattern to a file
    const fs = await import('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `music-pattern-${timestamp}.json`;
    
    await fs.promises.writeFile(filename, JSON.stringify(musicPattern, null, 2));
    console.log(`✅ Music pattern generated and saved to ${filename}`);
    
    // Print a preview of the generated pattern
    console.log('\nPreview of generated pattern:');
    console.log(JSON.stringify({
      tempo: musicPattern.tempo,
      timeSignature: musicPattern.timeSignature,
      patterns: Object.keys(musicPattern.patterns || {}).reduce((acc, key) => {
        acc[key] = `Array(${musicPattern.patterns[key]?.length || 0} notes)`;
        return acc;
      }, {})
    }, null, 2));
    
    return musicPattern;
  } catch (error) {
    console.error('❌ Failed to generate music pattern:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (process.argv[1] === import.meta.url.split('file://')[1]) {
  main().catch(console.error);
}

// Export the functions for use in other files
export { generateMusicPattern, callCerebrasAPI };
