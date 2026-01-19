
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("No API KEY found");
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        // Note: listModels is not directly exposed on the main class in some versions, 
        // but let's try the model manager if available or just a basic check.
        // Actually, newer SDKs expose it via the API.
        // Let's rely on standard fetch to the models endpoint if we can't find the method.
        // But let's try to infer from docs or just try a standard generation with a known model like gemini-1.5-flash to confirm basic connectivity first,
        // and print the error which usually lists models if 404.

        // Actually, the 404 error text usually says "Call ListModels".
        // I'll try to use the raw fetch to the API endpoint to list models.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods})`);
            });
        } else {
            console.log("No models returned or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
