
import { genkit } from 'genkit';
import { anthropic } from 'genkitx-anthropic';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
    anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
  ],
  model: 'googleai/gemini-flash-latest',
});
