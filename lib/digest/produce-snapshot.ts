import { db } from "@/lib/db";
import { aggregate, computeDeltas } from "./aggregate";
import { clusterTopics } from "./cluster-topics";
import { generateSummary } from "./summarize";
import type { IntelligenceSnapshot } from "./types";

const CLUSTERING_THRESHOLD = 20;
const SUMMARY_THRESHOLD = 5;

interface ProduceOptions {
  workspaceId: string;
  periodStart: Date;
  periodEnd: Date;
  /** Which boards to include. If empty, uses all workspace boards. */
  boardIds?: string[];
}

/**
 * Produce an IntelligenceSnapshot for a workspace.
 * Orchestrates aggregation, clustering, and summarization.
 * Stores the result in the DigestSnapshot table.
 */
export async function produceSnapshot(
  options: ProduceOptions,
): Promise<IntelligenceSnapshot> {
  const { workspaceId, periodStart, periodEnd } = options;

  const workspace = await db.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: {
      name: true,
      plan: true,
      boards: { select: { id: true } },
    },
  });

  // Determine which boards to include
  const boardIds =
    options.boardIds && options.boardIds.length > 0
      ? options.boardIds
      : workspace.boards.map((b) => b.id);

  // Step 1: Aggregate data
  const aggregation = await aggregate(
    workspaceId,
    periodStart,
    periodEnd,
    boardIds,
  );

  // Step 2: Compute deltas
  const delta = computeDeltas(
    aggregation.currentPeriod,
    aggregation.previousPeriod,
  );

  // Step 3: Topic clustering (with cold start fallback)
  const trendingTopics =
    aggregation.currentPeriod.totalPosts >= CLUSTERING_THRESHOLD
      ? await clusterTopics(
          aggregation.currentPeriod.postIds,
          aggregation.previousPeriod.postIds,
        )
      : buildCategoryFallback(aggregation.currentPeriod);

  // Step 4: Detect emerging themes from trending topics
  const emergingThemes = trendingTopics
    .filter((t) => t.isNew || t.postCount >= 3)
    .slice(0, 3)
    .map((t) => ({
      topic: t.topic,
      growthPercent: t.isNew ? 100 : 0,
      description: t.isNew
        ? `"${t.topic}" is a new theme this period with ${t.postCount} mentions`
        : `"${t.topic}" continues with ${t.postCount} mentions and ${t.totalVotes} votes`,
    }));

  // Step 5: Executive summary (skip if thin data)
  let executiveSummary: string | null = null;
  let recommendation: string | null = null;

  if (aggregation.currentPeriod.totalPosts >= SUMMARY_THRESHOLD) {
    const summaryResult = await generateSummary({
      totalNewPosts: aggregation.currentPeriod.totalPosts,
      totalNewVotes: aggregation.currentPeriod.totalVotes,
      totalNewComments: aggregation.currentPeriod.totalComments,
      delta,
      trendingTopics: trendingTopics.slice(0, 5),
      topPosts: aggregation.topPosts.slice(0, 3),
    });
    executiveSummary = summaryResult.summary;
    recommendation = summaryResult.recommendation;
  }

  const snapshot: IntelligenceSnapshot = {
    workspaceId,
    workspaceName: workspace.name,
    generatedAt: new Date().toISOString(),
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    boardIds,
    summary: {
      totalNewPosts: aggregation.currentPeriod.totalPosts,
      totalNewVotes: aggregation.currentPeriod.totalVotes,
      totalNewComments: aggregation.currentPeriod.totalComments,
      activeUsers: aggregation.currentPeriod.activeUserIds.length,
    },
    delta,
    insights: {
      trendingTopics,
      emergingThemes,
      topPosts: aggregation.topPosts,
      executiveSummary,
      recommendation,
    },
    boards: aggregation.boards,
  };

  // Store in DB
  const topTopic =
    trendingTopics.length > 0 ? trendingTopics[0].topic : null;

  await db.digestSnapshot.create({
    data: {
      workspaceId,
      periodStart,
      periodEnd,
      snapshot: JSON.parse(JSON.stringify(snapshot)),
      status: "success",
      totalNewPosts: aggregation.currentPeriod.totalPosts,
      engagementTrend: delta.engagementTrend,
      topTopic,
    },
  });

  return snapshot;
}

/**
 * Cold start fallback: when < 20 posts, use category counts
 * instead of embedding-based clustering.
 */
function buildCategoryFallback(period: import("./types").PeriodData) {
  const topics: import("./types").TrendingTopic[] = [];

  for (const [, data] of period.postsByCategory) {
    topics.push({
      topic: data.categoryName,
      postCount: data.count,
      totalVotes: 0,
      examplePostIds: [],
      sentiment: "neutral",
      isNew: false,
    });
  }

  return topics.sort((a, b) => b.postCount - a.postCount);
}
