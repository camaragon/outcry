"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
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

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    return { error: "No email address found on your account." };
  }

  if (!board) {
    return { error: "Board not found." };
  }

  // Find or create the user record for this workspace
  let dbUser = await db.user.findFirst({
    where: { clerkId: user.id, workspaceId: board.workspaceId },
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
        workspaceId: board.workspaceId,
      },
      select: { id: true },
    });
  }

  let post;

  try {
    post = await db.post.create({
      data: {
        title,
        body,
        boardId,
        authorId: dbUser.id,
      },
    });
  } catch {
    return { error: "Failed to create post. Please try again." };
  }

  revalidatePath(`/b/${board.workspace.slug}/${board.slug}`);
  return { data: post };
};

export const createPost = createSafeAction(CreatePost, handler);
