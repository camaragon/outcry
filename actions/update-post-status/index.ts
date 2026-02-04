"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdatePostStatus } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = await currentUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  const { postId, status } = data;

  // Look up the post + board + workspace
  const post = await db.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      board: {
        select: { id: true, workspaceId: true },
      },
    },
  });

  if (!post) {
    return { error: "Post not found." };
  }

  // Verify the user is OWNER or ADMIN in this workspace
  const dbUser = await db.user.findFirst({
    where: {
      clerkId: user.id,
      workspaceId: post.board.workspaceId,
      role: { in: ["OWNER", "ADMIN"] },
    },
    select: { id: true },
  });

  if (!dbUser) {
    return { error: "You do not have permission to update post status." };
  }

  let updatedPost;

  try {
    updatedPost = await db.post.update({
      where: { id: postId },
      data: { status },
    });
  } catch {
    return { error: "Failed to update post status. Please try again." };
  }

  revalidatePath(`/dashboard/board/${post.board.id}`);
  return { data: updatedPost };
};

export const updatePostStatus = createSafeAction(UpdatePostStatus, handler);
