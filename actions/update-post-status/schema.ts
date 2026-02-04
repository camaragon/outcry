import { z } from "zod";

export const UpdatePostStatus = z.object({
  postId: z.string().uuid({ message: "Invalid post" }),
  status: z.enum([
    "OPEN",
    "UNDER_REVIEW",
    "PLANNED",
    "IN_PROGRESS",
    "COMPLETE",
    "CLOSED",
  ]),
});
