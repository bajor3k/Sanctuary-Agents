import * as dotenv from 'dotenv';
import path from 'path';
const envPath = path.resolve(process.cwd(), '.env.local');
console.log("Loading env from:", envPath);
const result = dotenv.config({ path: envPath });
console.log("Dotenv result:", result.error ? "Error" : "Loaded");
if (result.error) console.error(result.error);
console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);

import { ai } from '../src/ai/genkit';

async function test() {
    console.log("Starting image generation test...");
    try {
        const start = Date.now();
        const response = await ai.generate({
            // using 'gemini-2.0-flash-exp-image-generation' which supports generateContent
            model: 'googleai/gemini-2.0-flash-exp-image-generation',
            prompt: 'A simple red circle',
            output: { format: 'media' }
        });
        console.log("Success!");
        console.log(JSON.stringify(response, null, 2));
    } catch (e: any) {
        console.error("Caught Error:");
        console.error(e);
        if (e.originalError) {
            console.error("Original Error Body:");
            console.error(JSON.stringify(e.originalError, null, 2));
        }
    }
}

test();
