
export interface ServiceAnalysis {
  name: string;
  summary: string;
  keywords: string[];
  suggestedSubreddits: string[];
  targetAudience: string;
}

export interface RedditLead {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  url: string;
  createdAt: number;
  score: number;
  aiScore?: number;
  aiReasoning?: string;
  suggestedReply?: string;
  profileInsight?: string;
  type: 'post' | 'comment';
}

export type TimeFilter = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';

export interface AppState {
  analyzing: boolean;
  scanning: boolean;
  analysis: ServiceAnalysis | null;
  activeKeywords: string[];
  activeSubreddits: string[];
  leads: RedditLead[];
  error: string | null;
  scoreThreshold: number;
  timeFilter: TimeFilter;
  isDarkMode: boolean;
}
