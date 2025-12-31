
/**
 * REDDIT SERVICE DOCUMENTATION
 * 
 * This service manages real-time data retrieval from the Reddit platform.
 * 
 * Flow:
 * 1. Authentication: Obtains an OAuth2 bearer token via client_credentials.
 * 2. Search Query Construction: Merges AI keywords with subreddit targeting.
 * 3. Execution: Fetches JSON results from the /search endpoint.
 * 4. Fallback Logic: Ensures users get data even if specific niches are empty.
 */

import { RedditLead, TimeFilter } from "../types";

// Note: These credentials are provided for the specific documentation task.
const CLIENT_ID = import.meta.env.VITE_REDDIT_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_REDDIT_CLIENT_SECRET;

/**
 * Obtains a fresh access token for the Reddit API.
 * Uses the OAuth2 Client Credentials grant type.
 */
export const getAccessToken = async (): Promise<string> => {
  const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Reddit Auth Error:', response.status, errorText);
    throw new Error(`Auth failed: ${response.status}. Please check Reddit Client ID/Secret.`);
  }

  const data = await response.json();
  return data.access_token;
};

/**
 * Main search function for finding potential leads.
 * @param token - Valid OAuth2 token
 * @param keywords - Array of search terms
 * @param subreddits - Array of target communities
 * @param timeFilter - Selected timeframe (hour, day, week, etc.)
 */
export const searchReddit = async (
  token: string,
  keywords: string[],
  subreddits: string[],
  timeFilter: TimeFilter
): Promise<RedditLead[]> => {
  const cleanSubs = (subreddits || [])
    .map(s => s.replace(/^r\//i, '').trim())
    .filter(s => s.length > 0);

  const keywordQuery = keywords.length > 0
    ? `(${keywords.slice(0, 5).join(' OR ')})`
    : '';

  const subQuery = cleanSubs.length > 0
    ? `(${cleanSubs.map(s => `subreddit:${s}`).join(' OR ')})`
    : '';

  // Tier 1: Targeted Search
  const finalQuery = [keywordQuery, subQuery].filter(Boolean).join(' ');
  let items = await executeSearch(token, finalQuery, timeFilter);

  // Tier 2 Fallback: If no niche results, expand to all of Reddit
  if (items.length === 0 && cleanSubs.length > 0) {
    console.log('No specific results found, falling back to broader keyword search...');
    items = await executeSearch(token, keywordQuery, timeFilter);
  }

  return items;
};

/**
 * Executes the raw HTTP fetch against Reddit's OAuth search endpoint.
 */
async function executeSearch(token: string, query: string, time: TimeFilter): Promise<RedditLead[]> {
  const url = `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&sort=relevance&t=${time}&limit=25&restrict_sr=0`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'LeadReddit/1.0.0 (by u/Objective-Wait-9298)'
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.data || !data.data.children) return [];

    return data.data.children.map((item: any) => ({
      id: item.data.id,
      title: item.data.title || "Reddit Conversation",
      content: item.data.selftext || item.data.body || "No content available.",
      author: item.data.author || "anonymous",
      subreddit: item.data.subreddit,
      url: `https://reddit.com${item.data.permalink}`,
      createdAt: item.data.created_utc,
      score: item.data.score || 0,
      type: item.data.title ? 'post' : 'comment'
    }));
  } catch (error) {
    console.error('Reddit fetching failed', error);
    return [];
  }
}
