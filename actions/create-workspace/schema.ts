import { z } from "zod";

export const CreateWorkspace = z.object({
  name: z
    .string()
    .min(2, { message: "Workspace name must be at least 2 characters" })
    .max(50, { message: "Workspace name must be less than 50 characters" }),
  slug: z
    .string()
    .min(2, { message: "URL slug must be at least 2 characters" })
    .max(50, { message: "URL slug must be less than 50 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "URL slug can only contain lowercase letters, numbers, and hyphens",
    }),
});
