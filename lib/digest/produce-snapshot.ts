import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { aggregate, computeDeltas } from "./aggregate";
import { clusterTopics } from "./cluster-topics";
import { generateSummary } from "./summarize";
import type { IntelligenceSnapshot, PeriodData, TrendingTopic } from "./types";

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
 * Always stores a DigestSnapshot row — even on failure — for observability.
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

  // Determine which boards to include, validating against workspace ownership
  const allowedBoardIds = new Set(workspace.boards.map((b) => b.id));

  let boardIds: string[];
  if (options.boardIds && options.boardIds.length > 0) {
    const invalidIds = options.boardIds.filter((id) => !allowedBoardIds.has(id));
    if (invalidIds.length > 0) {
      throw new Error(
        `Board IDs do not belong to this workspace: ${invalidIds.join(", ")}`,
      );
    }
    boardIds = options.boardIds;
  } else {
    boardIds = workspace.boards.map((b) => b.id);
  }

  try {
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
    // Note: growthPercent is a placeholder (100 for new, 0 otherwise).
    // Real WoW growth requires cross-period topic matching, planned for v2.
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

    // Store successful snapshot in DB
    const topTopic =
      trendingTopics.length > 0 ? trendingTopics[0].topic : null;

    const trendMap = { up: "UP", down: "DOWN", stable: "STABLE" } as const;

    await db.digestSnapshot.upsert({
      where: {
        workspaceId_periodStart_periodEnd: {
          workspaceId,
          periodStart,
          periodEnd,
        },
      },
      update: {
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
        status: "SUCCESS",
        failReason: null,
        totalNewPosts: aggregation.currentPeriod.totalPosts,
        engagementTrend: trendMap[delta.engagementTrend],
        topTopic,
      },
      create: {
        workspaceId,
        periodStart,
        periodEnd,
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
        status: "SUCCESS",
        totalNewPosts: aggregation.currentPeriod.totalPosts,
        engagementTrend: trendMap[delta.engagementTrend],
        topTopic,
      },
    });

    return snapshot;
  } catch (error) {
    // Always write a row on failure for observability
    const failReason =
      error instanceof Error ? error.message : String(error);

    console.error(
      `[digest] Failed to produce snapshot for workspace ${workspaceId}:`,
      error,
    );

    await db.digestSnapshot
      .upsert({
        where: {
          workspaceId_periodStart_periodEnd: {
            workspaceId,
            periodStart,
            periodEnd,
          },
        },
        update: {
          status: "FAILED",
          failReason,
        },
        create: {
          workspaceId,
          periodStart,
          periodEnd,
          status: "FAILED",
          failReason,
        },
      })
      .catch((dbErr) =>
        console.error("[digest] Failed to write failure row:", dbErr),
      );

    throw error;
  }
}

/**
 * Cold start fallback: when < 20 posts, use category counts
 * instead of embedding-based clustering.
 */
function buildCategoryFallback(period: PeriodData) {
  const topics: TrendingTopic[] = [];

  let categorizedCount = 0;
  for (const [, data] of period.postsByCategory) {
    categorizedCount += data.count;
    topics.push({
      topic: data.categoryName,
      postCount: data.count,
      totalVotes: data.totalVotes,
      examplePostIds: data.postIds.slice(0, 3),
      sentiment: "neutral",
      isNew: false,
      description: null, // Cold start — no AI descriptions for small boards
    });
  }

  // Add uncategorized bucket if significant
  const uncategorizedCount = period.totalPosts - categorizedCount;
  if (uncategorizedCount >= 3) {
    topics.push({
      topic: "Uncategorized feedback",
      postCount: uncategorizedCount,
      totalVotes: 0,
      examplePostIds: [],
      sentiment: "neutral",
      isNew: false,
      description: null,
    });
  }

  return topics.sort((a, b) => b.postCount - a.postCount);
}
