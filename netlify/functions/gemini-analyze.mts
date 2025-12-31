import { Context, Config } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";

export default async (req: Request, context: Context) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: "Missing Gemini API Key on Server" }), { status: 500 });
    }

    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { input } = await req.json();
        const ai = new GoogleGenAI({ apiKey });
        const isUrl = input.startsWith('http');

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: `Analyze the following ${isUrl ? 'URL' : 'service description'}: "${input}". 
      Extract the core business value, its target audience, and identify the most relevant keywords and subreddits for finding potential leads.
      Focus on "buyer intent" keywords (e.g., "alternative to", "how to solve", "looking for").`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestedSubreddits: { type: Type.ARRAY, items: { type: Type.STRING } },
                        targetAudience: { type: Type.STRING }
                    },
                    required: ["name", "summary", "keywords", "suggestedSubreddits", "targetAudience"]
                }
            }
        });

        return new Response((response as any).text(), { headers: { "Content-Type": "application/json" } });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export const config: Config = {
    path: "/api/gemini-analyze"
};
