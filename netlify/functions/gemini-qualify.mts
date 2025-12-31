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
        const { leads, analysis } = await req.json();
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a growth hacker for ${analysis.name} (${analysis.summary}).
    Analyze these ${leads.length} Reddit entries.
    For each entry:
    1. Provide a score (1-100) based on how likely the AUTHOR is to be a paying customer.
    2. Write "aiReasoning": why they are a lead.
    3. Write "profileInsight": Describe the profile/persona of this user based on their post (e.g., "Early stage founder", "Frustrated developer").
    4. Write "suggestedReply": A non-spammy, helpful reply.
    
    Items:
    ${leads.map((l: any, i: number) => `ID ${i}: [Author: u/${l.author}] [Sub: r/${l.subreddit}] ${l.title} - ${l.content.substring(0, 400)}`).join('\n')}
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            index: { type: Type.INTEGER },
                            aiScore: { type: Type.NUMBER },
                            aiReasoning: { type: Type.STRING },
                            profileInsight: { type: Type.STRING },
                            suggestedReply: { type: Type.STRING }
                        },
                        required: ["index", "aiScore", "aiReasoning", "profileInsight", "suggestedReply"]
                    }
                }
            }
        });

        return new Response((response as any).text(), { headers: { "Content-Type": "application/json" } });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export const config: Config = {
    path: "/api/gemini-qualify"
};
