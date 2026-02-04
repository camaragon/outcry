import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { CreatePost } from "./schema";
import { Post } from "@prisma/client";

export type InputType = z.infer<typeof CreatePost>;
export type ReturnType = ActionState<InputType, Post>;
