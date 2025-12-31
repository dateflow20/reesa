/**
 * GEMINI SERVICE DOCUMENTATION
 * 
 * This service handles all interactions with the Google GenAI API via server-side proxies.
 * 
 * Model Strategy:
 * 1. Analysis (Pro Model): interprets the business context. High reasoning required.
 * 2. Qualification (Flash Model): processes individual leads. High speed required.
 */

import { ServiceAnalysis, RedditLead } from "../types";

/**
 * Uses Gemini-3-Pro (via server proxy) to decompose a user's service into search parameters.
 * @param input - Service description or URL
 * @returns ServiceAnalysis object containing keywords and target niches.
 */
export const analyzeService = async (input: string): Promise<ServiceAnalysis> => {
  const response = await fetch('/api/gemini-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Analysis failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Uses Gemini-3-Flash (via server proxy) to evaluate a batch of Reddit posts against the business profile.
 * @param leads - Array of raw Reddit results
 * @param analysis - The business profile generated earlier
 * @returns Array of leads enriched with scores, insights, and outreach drafts.
 */
export const qualifyLeads = async (
  leads: RedditLead[],
  analysis: ServiceAnalysis
): Promise<RedditLead[]> => {
  if (leads.length === 0) return [];

  const response = await fetch('/api/gemini-qualify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leads, analysis })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Qualification failed: ${response.status} - ${errorText}`);
  }

  const evaluations = await response.json();

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
