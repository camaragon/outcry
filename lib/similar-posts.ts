import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/embeddings";

export interface SimilarPost {
  id: string;
  title: string;
  body: string;
  voteCount: number;
  status: string;
  similarity: number;
}

export async function findSimilarPosts(
  text: string,
  boardId: string,
  options?: { limit?: number; threshold?: number; excludePostId?: string },
): Promise<SimilarPost[]> {
  const { limit = 5, threshold = 0.3, excludePostId } = options ?? {};

  const embedding = await generateEmbedding(text);

  if (!embedding) {
    return [];
  }

  const embeddingStr = `[${embedding.join(",")}]`;

  const results = await db.$queryRaw<SimilarPost[]>`
    SELECT id, title, body, "voteCount", status,
           1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM "Post"
    WHERE "boardId" = ${boardId}
      AND embedding IS NOT NULL
      ${excludePostId ? Prisma.sql`AND id != ${excludePostId}` : Prisma.empty}
    ORDER BY embedding <=> ${embeddingStr}::vector ASC
    LIMIT ${limit}
  `;

  return results.filter((r) => r.similarity >= threshold);
}
