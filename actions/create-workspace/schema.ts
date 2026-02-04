import { z } from "zod";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "blog",
  "dashboard",
  "docs",
  "help",
  "login",
  "onboarding",
  "pricing",
  "settings",
  "sign-in",
  "sign-up",
  "support",
  "webhook",
  "webhooks",
]);

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
    })
    .refine((val) => !RESERVED_SLUGS.has(val), {
      message: "This URL is reserved. Please choose a different one.",
    }),
});
