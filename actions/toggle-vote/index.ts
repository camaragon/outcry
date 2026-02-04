"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { ToggleVote } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = await currentUser();

  if (!user?.id) {
    return { error: "You must be signed in to vote." };
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    return { error: "No email address found on your account." };
  }

  const { postId } = data;

  // Look up the post + board + workspace
  const post = await db.post.findUnique({
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
  });

  if (!post) {
    return { error: "Post not found." };
  }

  // Find or create the user record for this workspace
  let dbUser = await db.user.findFirst({
    where: { clerkId: user.id, workspaceId: post.board.workspaceId },
    select: { id: true },
  });

  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        clerkId: user.id,
        email,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null,
        avatarUrl: user.imageUrl,
        role: "USER",
        workspaceId: post.board.workspaceId,
      },
      select: { id: true },
    });
  }

  // Check for existing vote
  const existingVote = await db.vote.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: dbUser.id,
      },
    },
  });

  let updatedPost;

  try {
    if (existingVote) {
      // Remove vote
      await db.vote.delete({
        where: { id: existingVote.id },
      });

      updatedPost = await db.post.update({
        where: { id: postId },
        data: { voteCount: { decrement: 1 } },
      });
    } else {
      // Add vote
      await db.vote.create({
        data: {
          postId,
          userId: dbUser.id,
        },
      });

      updatedPost = await db.post.update({
        where: { id: postId },
        data: { voteCount: { increment: 1 } },
      });
    }
  } catch {
    return { error: "Failed to toggle vote. Please try again." };
  }

  revalidatePath(`/b/${post.board.workspace.slug}/${post.board.slug}`);
  return { data: updatedPost };
};

export const toggleVote = createSafeAction(ToggleVote, handler);
