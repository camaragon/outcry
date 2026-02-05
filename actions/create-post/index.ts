"use server";

import { currentUser } from "@clerk/nextjs/server";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { findOrCreateUser } from "@/lib/find-or-create-user";
import { generateEmbedding } from "@/lib/embeddings";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreatePost } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { title, body, boardId } = data;

  // Parallelize independent calls
  const [user, board] = await Promise.all([
    currentUser(),
    db.board.findUnique({
      where: { id: boardId },
      select: { id: true, workspaceId: true, slug: true, workspace: { select: { slug: true } } },
    }),
  ]);

  if (!user?.id) {
    return { error: "You must be signed in to create a post." };
  }

  if (!board) {
    return { error: "Board not found." };
  }

  const userResult = await findOrCreateUser(user, board.workspaceId);
  if (!userResult.ok) {
    return { error: userResult.error };
  }

  let post;

  try {
    post = await db.post.create({
      data: {
        title,
        body,
        boardId,
        authorId: userResult.id,
      },
    });
  } catch {
    return { error: "Failed to create post. Please try again." };
  }

  // Generate embedding after response is sent (survives serverless shutdown)
  after(async () => {
    try {
      const embedding = await generateEmbedding(`${title} ${body}`);
      if (!embedding) return;
      const embeddingStr = `[${embedding.join(",")}]`;
      await db.$executeRaw`
        UPDATE "Post" SET embedding = ${embeddingStr}::vector WHERE id = ${post.id}
      `;
    } catch (err) {
      console.error("[embedding] Failed to generate embedding:", err);
    }
  });

  revalidatePath(`/b/${board.workspace.slug}/${board.slug}`);
  return { data: post };
};

export const createPost = createSafeAction(CreatePost, handler);
