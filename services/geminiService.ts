
/**
 * GEMINI SERVICE DOCUMENTATION
 * 
 * This service handles all interactions with the Google GenAI API.
 * 
 * Model Strategy:
 * 1. Analysis (Pro Model): interprets the business context. High reasoning required.
 * 2. Qualification (Flash Model): processes individual leads. High speed required.
 * 
 * Safety & Reliability:
 * - Uses strict responseSchema to ensure JSON outputs match TypeScript interfaces.
 * - Prompt engineering focused on "Buyer Intent" and "Value Proposition".
 */

import { GoogleGenAI, Type } from "@google/genai";
import { ServiceAnalysis, RedditLead } from "../types";

console.log("Gemini API Key:", import.meta.env.VITE_GEMINI_API_KEY ? "Present" : "Missing");
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

/**
 * Uses Gemini-3-Pro to decompose a user's service into search parameters.
 * @param input - Service description or URL
 * @returns ServiceAnalysis object containing keywords and target niches.
 */
export const analyzeService = async (input: string): Promise<ServiceAnalysis> => {
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

  return JSON.parse(response.text());
};

/**
 * Uses Gemini-3-Flash to evaluate a batch of Reddit posts against the business profile.
 * @param leads - Array of raw Reddit results
 * @param analysis - The business profile generated earlier
 * @returns Array of leads enriched with scores, insights, and outreach drafts.
 */
export const qualifyLeads = async (
  leads: RedditLead[],
  analysis: ServiceAnalysis
): Promise<RedditLead[]> => {
  if (leads.length === 0) return [];

  const prompt = `You are a growth hacker for ${analysis.name} (${analysis.summary}).
  Analyze these ${leads.length} Reddit entries.
  For each entry:
  1. Provide a score (1-100) based on how likely the AUTHOR is to be a paying customer.
  2. Write "aiReasoning": why they are a lead.
  3. Write "profileInsight": Describe the profile/persona of this user based on their post (e.g., "Early stage founder", "Frustrated developer").
  4. Write "suggestedReply": A non-spammy, helpful reply.
  
  Items:
  ${leads.map((l, i) => `ID ${i}: [Author: u/${l.author}] [Sub: r/${l.subreddit}] ${l.title} - ${l.content.substring(0, 400)}`).join('\n')}
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

  const evaluations = JSON.parse(response.text());

  return leads.map((lead, i) => {
    const evalItem = evaluations.find((e: any) => e.index === i);
    return {
      ...lead,
      aiScore: evalItem?.aiScore || 0,
      aiReasoning: evalItem?.aiReasoning || "N/A",
      profileInsight: evalItem?.profileInsight || "Potential user",
      suggestedReply: evalItem?.suggestedReply || ""
    };
  }).sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
};
