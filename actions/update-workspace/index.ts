"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateWorkspace } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = await currentUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  const { workspaceId, name } = data;

  // Verify user is OWNER or ADMIN
  const dbUser = await db.user.findFirst({
    where: {
      clerkId: user.id,
      workspaceId,
      role: { in: ["OWNER", "ADMIN"] },
    },
    select: { id: true },
  });

  if (!dbUser) {
    return { error: "Workspace not found or access denied." };
  }

  let workspace;

  try {
    workspace = await db.workspace.update({
      where: { id: workspaceId },
      data: { name },
    });
  } catch {
    return { error: "Failed to update workspace. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { data: workspace };
};

export const updateWorkspace = createSafeAction(UpdateWorkspace, handler);
