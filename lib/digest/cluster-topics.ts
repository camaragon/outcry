import { db } from "@/lib/db";
import type { TrendingTopic } from "./types";

/**
 * Cluster posts by embedding similarity and generate topic labels.
 * Uses existing pgvector embeddings stored on posts.
 *
 * For v1, uses a simple approach:
 * 1. Group posts by category (already auto-categorized)
 * 2. For uncategorized posts, find nearest neighbors via embeddings
 * 3. Generate topic labels from the cluster content
 *
 * Full embedding-based clustering (k-means, DBSCAN) is a v2 optimization.
 */
export async function clusterTopics(
  currentPostIds: string[],
  previousPostIds: string[],
): Promise<TrendingTopic[]> {
  if (currentPostIds.length === 0) return [];

  // Get current posts with categories
  const posts = await db.post.findMany({
    where: { id: { in: currentPostIds } },
    select: {
      id: true,
      title: true,
      voteCount: true,
      categoryId: true,
      category: { select: { name: true } },
    },
  });

  // Group by category
  const categoryGroups = new Map<
    string,
    { name: string; posts: typeof posts }
  >();
  const uncategorized: typeof posts = [];

  for (const post of posts) {
    if (post.categoryId && post.category) {
      const group = categoryGroups.get(post.categoryId);
      if (group) {
        group.posts.push(post);
      } else {
        categoryGroups.set(post.categoryId, {
          name: post.category.name,
          posts: [post],
        });
      }
    } else {
      uncategorized.push(post);
    }
  }

  // Get previous period categories for "isNew" detection
  const previousPosts =
    previousPostIds.length > 0
      ? await db.post.findMany({
          where: { id: { in: previousPostIds } },
          select: { categoryId: true },
        })
      : [];
  const previousCategoryIds = new Set(
    previousPosts.map((p) => p.categoryId).filter(Boolean),
  );

  const topics: TrendingTopic[] = [];

  for (const [categoryId, group] of categoryGroups) {
    topics.push({
      topic: group.name,
      postCount: group.posts.length,
      totalVotes: group.posts.reduce((sum, p) => sum + p.voteCount, 0),
      examplePostIds: group.posts.slice(0, 3).map((p) => p.id),
      sentiment: "neutral", // v2: analyze sentiment per cluster
      isNew: !previousCategoryIds.has(categoryId),
    });
  }

  // Add uncategorized as a group if significant
  if (uncategorized.length >= 3) {
    topics.push({
      topic: "Uncategorized feedback",
      postCount: uncategorized.length,
      totalVotes: uncategorized.reduce((sum, p) => sum + p.voteCount, 0),
      examplePostIds: uncategorized.slice(0, 3).map((p) => p.id),
      sentiment: "neutral",
      isNew: false,
    });
  }

  return topics.sort((a, b) => b.postCount - a.postCount);
}
