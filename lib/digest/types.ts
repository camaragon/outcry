/**
 * Intelligence Snapshot — the core artifact produced by the digest engine.
 * Email, Slack bot, and in-app dashboard are all consumers of this structure.
 */

export interface TrendingTopic {
  topic: string;
  postCount: number;
  totalVotes: number;
  examplePostIds: string[];
  sentiment: "positive" | "neutral" | "frustrated";
  isNew: boolean;
}

export interface EmergingTheme {
  topic: string;
  growthPercent: number;
  description: string;
}

export interface TopPost {
  id: string;
  title: string;
  voteCount: number;
  commentCount: number;
  category: string | null;
  status: string;
}

export interface BoardSummary {
  boardId: string;
  boardName: string;
  newPosts: number;
  newVotes: number;
  topTopic: string | null;
}

export interface IntelligenceSnapshot {
  workspaceId: string;
  workspaceName: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  boardIds: string[];

  summary: {
    totalNewPosts: number;
    totalNewVotes: number;
    totalNewComments: number;
    activeUsers: number;
  };

  delta: {
    postsChange: number;
    postsChangePercent: number;
    votesChange: number;
    votesChangePercent: number;
    engagementTrend: "up" | "down" | "stable";
  };

  insights: {
    trendingTopics: TrendingTopic[];
    emergingThemes: EmergingTheme[];
    topPosts: TopPost[];
    executiveSummary: string | null;
    recommendation: string | null;
  };

  boards: BoardSummary[];
}

export interface AggregationResult {
  currentPeriod: PeriodData;
  previousPeriod: PeriodData;
  boards: BoardSummary[];
  topPosts: TopPost[];
}

export interface PeriodData {
  totalPosts: number;
  totalVotes: number;
  totalComments: number;
  activeUserIds: string[];
  postsByCategory: Map<string, { count: number; categoryName: string; totalVotes: number; postIds: string[] }>;
  postIds: string[];
}
