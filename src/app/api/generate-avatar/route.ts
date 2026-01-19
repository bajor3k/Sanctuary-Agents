export const runtime = "nodejs";

import { generateAvatarFlow } from "@/ai/flows/generate-avatar-flow";

export async function POST(req: Request) {
    console.log("POST /api/generate-avatar hit");
    try {
        const body = await req.json().catch(() => ({}));
        const { image } = body;

        if (!image) {
            console.error("Missing image in request body");
            return Response.json({ error: "No image provided" }, { status: 400 });
        }

        console.log("Calling generateAvatarFlow...");
        const result = await generateAvatarFlow({ photoUrl: image });
        console.log("generateAvatarFlow success");

        return Response.json(result);
    } catch (error: any) {
        console.error("Error in /api/generate-avatar:", error);
        return Response.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
