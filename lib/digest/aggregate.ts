import { db } from "@/lib/db";
import type {
  AggregationResult,
  PeriodData,
  BoardSummary,
  TopPost,
} from "./types";

/**
 * Aggregate feedback data for a workspace over a time period.
 * Pure database queries — no AI involved.
 */
export async function aggregatePeriod(
  workspaceId: string,
  periodStart: Date,
  periodEnd: Date,
  boardIds: string[],
): Promise<PeriodData> {
  const boardFilter = {
    boardId: { in: boardIds },
    board: { workspaceId },
  };

  const [posts, votes, comments] = await Promise.all([
    db.post.findMany({
      where: {
        ...boardFilter,
        createdAt: { gte: periodStart, lt: periodEnd },
      },
      // Note: voteCount is a lifetime total, not period-scoped. This is
      // intentional for v1 — users expect to see total popularity. Period-scoped
      // vote counts are used separately in the delta computation via db.vote.count().
      select: {
        id: true,
        authorId: true,
        voteCount: true,
        categoryId: true,
        category: { select: { name: true } },
      },
    }),
    db.vote.count({
      where: {
        post: boardFilter,
        createdAt: { gte: periodStart, lt: periodEnd },
      },
    }),
    db.comment.count({
      where: {
        post: boardFilter,
        createdAt: { gte: periodStart, lt: periodEnd },
      },
    }),
  ]);

  const activeUserIds = [...new Set(posts.map((p) => p.authorId))];

  const postsByCategory = new Map<
    string,
    { count: number; categoryName: string; totalVotes: number; postIds: string[] }
  >();
  for (const post of posts) {
    if (post.categoryId && post.category) {
      const existing = postsByCategory.get(post.categoryId);
      if (existing) {
        existing.count++;
        existing.totalVotes += post.voteCount;
        existing.postIds.push(post.id);
      } else {
        postsByCategory.set(post.categoryId, {
          count: 1,
          categoryName: post.category.name,
          totalVotes: post.voteCount,
          postIds: [post.id],
        });
      }
    }
  }

  return {
    totalPosts: posts.length,
    totalVotes: votes,
    totalComments: comments,
    activeUserIds,
    postsByCategory,
    postIds: posts.map((p) => p.id),
  };
}

/**
 * Get the top posts by engagement (votes + comments) for the period.
 */
export async function getTopPosts(
  boardIds: string[],
  periodStart: Date,
  periodEnd: Date,
  limit = 5,
): Promise<TopPost[]> {
  const posts = await db.post.findMany({
    where: {
      boardId: { in: boardIds },
      createdAt: { gte: periodStart, lt: periodEnd },
    },
    select: {
      id: true,
      title: true,
      voteCount: true,
      status: true,
      category: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [
      { voteCount: "desc" },
      { comments: { _count: "desc" } },
    ],
    take: limit,
  });

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    voteCount: p.voteCount,
    commentCount: p._count.comments,
    category: p.category?.name ?? null,
    status: p.status,
  }));
}

/**
 * Get per-board breakdown for multi-board digests.
 */
export async function getBoardSummaries(
  workspaceId: string,
  boardIds: string[],
  periodStart: Date,
  periodEnd: Date,
): Promise<BoardSummary[]> {
  const boards = await db.board.findMany({
    where: { id: { in: boardIds }, workspaceId },
    select: { id: true, name: true },
  });

  const summaries = await Promise.all(
    boards.map(async (board) => {
      const [postCount, voteCount, topCategory] = await Promise.all([
        db.post.count({
          where: {
            boardId: board.id,
            createdAt: { gte: periodStart, lt: periodEnd },
          },
        }),
        db.vote.count({
          where: {
            post: { boardId: board.id },
            createdAt: { gte: periodStart, lt: periodEnd },
          },
        }),
        db.post
          .groupBy({
            by: ["categoryId"],
            where: {
              boardId: board.id,
              createdAt: { gte: periodStart, lt: periodEnd },
              categoryId: { not: null },
            },
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
            take: 1,
          })
          .then(async (groups) => {
            if (groups.length === 0 || !groups[0].categoryId) return null;
            const cat = await db.category.findUnique({
              where: { id: groups[0].categoryId },
              select: { name: true },
            });
            return cat?.name ?? null;
          }),
      ]);

      return {
        boardId: board.id,
        boardName: board.name,
        newPosts: postCount,
        newVotes: voteCount,
        topTopic: topCategory,
      };
    }),
  );

  return summaries;
}

/**
 * Full aggregation: current period + previous period + board summaries + top posts.
 * Computes everything needed for delta calculation.
 */
export async function aggregate(
  workspaceId: string,
  periodStart: Date,
  periodEnd: Date,
  boardIds: string[],
): Promise<AggregationResult> {
  const periodMs = periodEnd.getTime() - periodStart.getTime();
  const previousStart = new Date(periodStart.getTime() - periodMs);
  const previousEnd = periodStart;

  const [currentPeriod, previousPeriod, boards, topPosts] = await Promise.all([
    aggregatePeriod(workspaceId, periodStart, periodEnd, boardIds),
    aggregatePeriod(workspaceId, previousStart, previousEnd, boardIds),
    getBoardSummaries(workspaceId, boardIds, periodStart, periodEnd),
    getTopPosts(boardIds, periodStart, periodEnd),
  ]);

  return { currentPeriod, previousPeriod, boards, topPosts };
}

/**
 * Compute deltas between current and previous periods.
 */
export function computeDeltas(current: PeriodData, previous: PeriodData) {
  const postsChange = current.totalPosts - previous.totalPosts;
  const votesChange = current.totalVotes - previous.totalVotes;

  const postsChangePercent =
    previous.totalPosts > 0
      ? Math.round((postsChange / previous.totalPosts) * 100)
      : current.totalPosts > 0
        ? 100
        : 0;

  const votesChangePercent =
    previous.totalVotes > 0
      ? Math.round((votesChange / previous.totalVotes) * 100)
      : current.totalVotes > 0
        ? 100
        : 0;

  const totalEngagement =
    current.totalPosts + current.totalVotes + current.totalComments;
  const prevEngagement =
    previous.totalPosts + previous.totalVotes + previous.totalComments;

  let engagementTrend: "up" | "down" | "stable";
  if (totalEngagement > prevEngagement * 1.1) {
    engagementTrend = "up";
  } else if (totalEngagement < prevEngagement * 0.9) {
    engagementTrend = "down";
  } else {
    engagementTrend = "stable";
  }

  return {
    postsChange,
    postsChangePercent,
    votesChange,
    votesChangePercent,
    engagementTrend,
  };
}
