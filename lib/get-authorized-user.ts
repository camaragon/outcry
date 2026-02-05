import { cache } from "react";
import { db } from "@/lib/db";

/**
 * Get a user with OWNER or ADMIN role for a workspace.
 * Cached per request to deduplicate auth queries when multiple actions run.
 */
export const getAuthorizedUser = cache(
  async (clerkId: string, workspaceId: string) => {
    return db.user.findFirst({
      where: {
        clerkId,
        workspaceId,
        role: { in: ["OWNER", "ADMIN"] },
      },
      select: { id: true },
    });
  },
);
