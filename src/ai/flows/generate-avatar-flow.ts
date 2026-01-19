'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAvatarInputSchema = z.object({
    photoUrl: z.string().describe('The base64 encoded photo of the user.'),
});

const GenerateAvatarOutputSchema = z.object({
    avatarUrl: z.string().optional().describe('The generated avatar image as a base64 string or URL.'),
    error: z.string().optional(),
});

export async function generateAvatarFlow(input: z.infer<typeof GenerateAvatarInputSchema>) {
    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is missing");
        // Fallback to demo mode if no key
        return generateMockResponse();
    }

    try {
        // Step 1: Analyze the photo using Gemini to get a description
        let description = "A person";
        try {
            const descriptionResponse = await ai.generate({
                model: 'googleai/gemini-2.0-flash',
                prompt: [
                    { text: "Describe the person in this photo to ensure a generated avatar looks like them. Explicitly state gender, skin tone (be specific), age, hair color/style, facial hair, glasses, and distinctive features. Keep it concise." },
                    { media: { url: input.photoUrl } }
                ],
                config: { temperature: 0.5 },
            });
            description = descriptionResponse.text;
        } catch (err) {
            console.warn("Gemini description generation failed, using default description.", err);
        }

        console.log("Avatar Description:", description);

        // Step 2: Generate the avatar
        // Try using the experimental image generation model
        const imageResponse = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp-image-generation',
            prompt: `A profile picture of a person in the style of The Simpsons (Matt Groening). Yellow skin #FFD90F, overbite, bulging eyes, simple lines, flat colors. The character MUST MATCH this description: ${description}. Maintain gender, hair, and distinct facial features but adapting them to the Simpsons universe. Colorful solid background.`,
            output: { format: 'media' }
        });

        const media = imageResponse.media;

        if (media && media.url) {
            return { avatarUrl: media.url };
        } else {
            throw new Error("No media returned from image generation");
        }

    } catch (error) {
        console.error("Error in generateAvatar (falling back to demo):", error);
        return generateMockResponse();
    }
}

async function generateMockResponse() {
    console.log("Generating mock avatar response (Fallback)");
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate a random seed
    const seed = Math.random().toString(36).substring(7);
    return {
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`
    };
}
