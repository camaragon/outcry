"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateWorkspace } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return { error: "Unauthorized" };
  }

  const { name, slug } = data;

  // Check if slug is already taken
  const existing = await db.workspace.findUnique({
    where: { slug },
  });

  if (existing) {
    return { error: "This URL is already taken. Please choose a different one." };
  }

  let workspace;

  try {
    workspace = await db.workspace.create({
      data: {
        name,
        slug,
        users: {
          create: {
            clerkId: userId,
            email: user.emailAddresses[0]?.emailAddress ?? "",
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
    });
  } catch {
    return { error: "Failed to create workspace. Please try again." };
  }

  revalidatePath("/dashboard");
  return { data: workspace };
};

export const createWorkspace = createSafeAction(CreateWorkspace, handler);
