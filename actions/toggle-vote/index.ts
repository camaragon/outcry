"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { findOrCreateUser } from "@/lib/find-or-create-user";
import { createSafeAction } from "@/lib/create-safe-action";
import { ToggleVote } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { postId } = data;

  // Parallelize independent calls
  const [user, post] = await Promise.all([
    currentUser(),
    db.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        boardId: true,
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
    return { error: "You must be signed in to vote." };
  }

  if (!post) {
    return { error: "Post not found." };
  }

  const userResult = await findOrCreateUser(user, post.board.workspaceId);
  if (!userResult.ok) {
    return { error: userResult.error };
  }

  let updatedPost;

  try {
    updatedPost = await db.$transaction(async (tx) => {
      const existingVote = await tx.vote.findUnique({
        where: {
          postId_userId: {
            postId,
            userId: userResult.id,
          },
        },
      });

      if (existingVote) {
        await tx.vote.delete({
          where: { id: existingVote.id },
        });

        return tx.post.update({
          where: { id: postId },
          data: { voteCount: { decrement: 1 } },
        });
      } else {
        await tx.vote.create({
          data: {
            postId,
            userId: userResult.id,
          },
        });

        return tx.post.update({
          where: { id: postId },
          data: { voteCount: { increment: 1 } },
        });
      }
    });
  } catch {
    return { error: "Failed to toggle vote. Please try again." };
  }

  revalidatePath(`/b/${post.board.workspace.slug}/${post.board.slug}`);
  return { data: updatedPost };
};

export const toggleVote = createSafeAction(ToggleVote, handler);
