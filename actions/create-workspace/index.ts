"use server";

import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { after } from "next/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateWorkspace } from "./schema";
import { seedDemoDigest } from "@/lib/digest/seed-demo";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = await currentUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  // Guard: prevent duplicate workspace creation
  const existingUser = await db.user.findFirst({
    where: { clerkId: user.id },
    select: { id: true },
  });

  if (existingUser) {
    return { error: "You already have a workspace." };
  }

  const { name, slug, productCategory } = data;

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    return { error: "No email address found on your account." };
  }

  let workspace;

  try {
    workspace = await db.workspace.create({
      data: {
        name,
        slug,
        productCategory,
        users: {
          create: {
            clerkId: user.id,
            email,
            name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null,
            avatarUrl: user.imageUrl,
            role: "OWNER",
          },
        },
        boards: {
          create: {
            name: "Feature Requests",
            slug: "feature-requests",
          },
        },
      },
      include: {
        boards: { select: { id: true }, take: 1 },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "This URL is already taken. Please choose a different one." };
    }
    return { error: "Failed to create workspace. Please try again." };
  }

  // Trigger demo digest seeding + email in the background
  const boardId = workspace.boards[0]?.id;
  if (boardId && productCategory) {
    after(async () => {
      await seedDemoDigest(workspace.id, boardId, productCategory).catch(
        (err) => console.error("[create-workspace] Demo digest failed:", err),
      );
    });
  }

  revalidatePath("/dashboard");
  return { data: workspace };
};

export const createWorkspace = createSafeAction(CreateWorkspace, handler);
