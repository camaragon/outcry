import OpenAI from "openai";
import type { TrendingTopic, TopPost } from "./types";

let client: OpenAI | null = null;
let warnedMissingKey = false;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    if (!warnedMissingKey) {
      console.warn(
        "[digest-summary] OPENAI_API_KEY is not set — skipping AI summary",
      );
      warnedMissingKey = true;
    }
    return null;
  }
  if (!client) {
    client = new OpenAI();
  }
  return client;
}

interface SummaryInput {
  totalNewPosts: number;
  totalNewVotes: number;
  totalNewComments: number;
  delta: {
    postsChange: number;
    postsChangePercent: number;
    votesChange: number;
    votesChangePercent: number;
    engagementTrend: "up" | "down" | "stable";
  };
  trendingTopics: TrendingTopic[];
  topPosts: TopPost[];
}

interface SummaryResult {
  summary: string | null;
  recommendation: string | null;
}

/**
 * Generate an executive summary and actionable recommendation
 * from the aggregated digest data.
 *
 * Returns null for both if the OpenAI key is missing or the API fails.
 */
export async function generateSummary(
  input: SummaryInput,
): Promise<SummaryResult> {
  const openai = getClient();
  if (!openai) return { summary: null, recommendation: null };

  const topicsStr = input.trendingTopics
    .map(
      (t) =>
        `- "${t.topic}": ${t.postCount} posts, ${t.totalVotes} votes${t.isNew ? " (NEW this week)" : ""}`,
    )
    .join("\n");

  const topPostsStr = input.topPosts
    .map((p) => `- "${p.title}" (${p.voteCount} votes, ${p.commentCount} comments)`)
    .join("\n");

  const trendWord =
    input.delta.engagementTrend === "up"
      ? "increasing"
      : input.delta.engagementTrend === "down"
        ? "declining"
        : "steady";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_completion_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a sharp product analyst writing a brief for a PM team. Be specific, data-driven, and actionable. No filler, no hedging. Write like you're briefing a busy executive who needs to know what matters.

Respond in JSON format:
{
  "summary": "2-3 sentences summarizing the key patterns and what they mean",
  "recommendation": "One specific, actionable recommendation based on the data"
}`,
        },
        {
          role: "user",
          content: `This week's feedback data:
- ${input.totalNewPosts} new posts (${input.delta.postsChangePercent >= 0 ? "+" : ""}${input.delta.postsChangePercent}% vs last week)
- ${input.totalNewVotes} new votes (${input.delta.votesChangePercent >= 0 ? "+" : ""}${input.delta.votesChangePercent}% vs last week)
- ${input.totalNewComments} new comments
- Overall engagement: ${trendWord}

Trending topics:
${topicsStr || "No clear topics this week"}

Top posts by engagement:
${topPostsStr || "No posts this week"}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return { summary: null, recommendation: null };

    try {
      const parsed = JSON.parse(content);
      return {
        summary: parsed.summary || null,
        recommendation: parsed.recommendation || null,
      };
    } catch {
      // If JSON parsing fails, use raw text as summary
      return { summary: content, recommendation: null };
    }
  } catch (error) {
    console.error("[digest-summary] Failed to generate summary:", error);
    return { summary: null, recommendation: null };
  }
}
