"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { findOrCreateUser } from "@/lib/find-or-create-user";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateComment } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { body, postId } = data;

  // Parallelize independent calls
  const [user, post] = await Promise.all([
    currentUser(),
    db.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        board: {
          select: {
            workspaceId: true,
            slug: true,
            workspace: { select: { slug: true } },
          },
        },
      },
    }),
  ]);

  if (!user?.id) {
    return { error: "You must be signed in to comment." };
  }

  if (!post) {
    return { error: "Post not found." };
  }

  const userResult = await findOrCreateUser(user, post.board.workspaceId);
  if (!userResult.ok) {
    return { error: userResult.error };
  }

  const isAdmin = userResult.role === "OWNER" || userResult.role === "ADMIN";

  let comment;

  try {
    comment = await db.comment.create({
      data: {
        body,
        postId,
        authorId: userResult.id,
        isAdmin,
      },
    });
  } catch {
    return { error: "Failed to create comment. Please try again." };
  }

  const boardPath = `/b/${post.board.workspace.slug}/${post.board.slug}`;
  revalidatePath(boardPath);
  revalidatePath(`${boardPath}/${postId}`);
  return { data: comment };
};

export const createComment = createSafeAction(CreateComment, handler);
