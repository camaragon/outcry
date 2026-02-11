import { z } from "zod";

export const UpdateWorkspace = z.object({
  workspaceId: z.string().uuid(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be 50 characters or less"),
});
