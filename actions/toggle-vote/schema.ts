import { z } from "zod";

export const ToggleVote = z.object({
  postId: z.string().uuid({ message: "Invalid post" }),
});
