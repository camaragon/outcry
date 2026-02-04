import { z } from "zod";
import { POST_STATUSES } from "@/lib/post-statuses";

export const UpdatePostStatus = z.object({
  postId: z.string().uuid({ message: "Invalid post" }),
  status: z.enum(POST_STATUSES),
});
