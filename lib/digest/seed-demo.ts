import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/embeddings";
import { getSampleData } from "./sample-data";
import { produceSnapshot } from "./produce-snapshot";
import { sendDigestEmail } from "./send-digest";

/**
 * Seed a workspace with sample feedback data and trigger a demo digest.
 * Called during onboarding after workspace creation.
 *
 * Flow:
 * 1. Create categories from the sample data set
 * 2. Create sample posts with staggered timestamps and vote counts
 * 3. Generate embeddings for sample posts (for similar-posts feature)
 * 4. Run the intelligence engine against the sample data
 * 5. Send the demo digest email to the workspace owner
 */
export async function seedDemoDigest(
  workspaceId: string,
  boardId: string,
  productCategory: string,
): Promise<void> {
  const sampleData = getSampleData(productCategory);
  const now = new Date();

  // Step 1: Create categories
  const categoryMap = new Map<string, string>();
  for (const cat of sampleData.categories) {
    const created = await db.category.create({
      data: {
        name: cat.name,
        color: cat.color,
        workspaceId,
      },
    });
    categoryMap.set(cat.name, created.id);
  }

  // Step 2: Create a demo user (the "sample feedback" author)
  // Use the workspace owner as the author for sample posts
  const owner = await db.user.findFirst({
    where: { workspaceId, role: "OWNER" },
    select: { id: true },
  });

  if (!owner) {
    console.error("[seed-demo] No owner found for workspace", workspaceId);
    return;
  }

  // Step 3: Create sample posts with staggered timestamps
  const postIds: string[] = [];
  for (const sample of sampleData.posts) {
    const categoryId = categoryMap.get(sample.category);
    const createdAt = new Date(now.getTime() - sample.daysAgo * 24 * 60 * 60 * 1000);

    const post = await db.post.create({
      data: {
        title: sample.title,
        body: sample.body,
        boardId,
        authorId: owner.id,
        categoryId: categoryId || null,
        voteCount: sample.voteCount,
        createdAt,
      },
    });
    postIds.push(post.id);
  }

  // Step 4: Generate embeddings in parallel (best effort)
  await Promise.allSettled(
    postIds.map(async (postId) => {
      const post = await db.post.findUnique({
        where: { id: postId },
        select: { title: true, body: true },
      });
      if (!post) return;

      const embedding = await generateEmbedding(`${post.title} ${post.body}`);
      if (!embedding) return;

      const embeddingStr = `[${embedding.join(",")}]`;
      await db.$executeRaw`
        UPDATE "Post" SET embedding = ${embeddingStr}::vector WHERE id = ${postId}
      `;
    }),
  );

  // Step 5: Produce the demo digest snapshot
  const periodEnd = now;
  const periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const snapshot = await produceSnapshot({
      workspaceId,
      periodStart,
      periodEnd,
      boardIds: [boardId],
    });

    // Step 6: Send the demo digest email
    await sendDigestEmail({ snapshot, isDemo: true });

    console.log(
      `[seed-demo] Demo digest sent for workspace ${workspaceId}`,
    );
  } catch (error) {
    console.error("[seed-demo] Failed to produce/send demo digest:", error);
    // Don't throw — workspace creation should still succeed even if the demo digest fails
  }
}
