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
        const { transcript } = await req.json();
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `You are an expert editor. The user is speaking a business idea or marketing context for a lead generation tool. 
      The speech-to-text output is messy and may contain errors.
      
      Raw Transcript: "${transcript}"
      
      Task: Rewrite this transcript to be clear, professional, and concise. 
      - Fix grammar and nonsensical words based on context.
      - Keep the core business meaning.
      - Do NOT add any conversational filler (like "Here is the corrected text"). Just return the cleaned text.`,
        });

        return new Response(JSON.stringify({ refinedText: (response as any).text() }), { headers: { "Content-Type": "application/json" } });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export const config: Config = {
    path: "/api/gemini-refine"
};
