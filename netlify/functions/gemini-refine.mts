import { Context, Config } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

export default async (req: Request, context: Context) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: "Missing Gemini API Key on Server" }), { status: 500 });
    }

    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { text } = await req.json();
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `You are a helpful AI assistant that refines voice-to-text transcripts.
      The user was speaking to an AI to describe a business or service.
      The raw transcript may contain stuttering, repetitions, or nonsense words due to audio glitches.
      
      Task:
      1. Fix grammar and remove repetitions/stuttering.
      2. Ensure the text makes sense as a description of a service or a request.
      3. Keep it concise but preserve the original intent.
      4. If the text is completely gibberish, return "Unable to understand audio."
      
      Raw Transcript: "${text}"
      
      Return ONLY the refined text.`,
        });

        return new Response(JSON.stringify({ refinedText: (response as any).text() }), { headers: { "Content-Type": "application/json" } });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export const config: Config = {
    path: "/api/gemini-refine"
};
