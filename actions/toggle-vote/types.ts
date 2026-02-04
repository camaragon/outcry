import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { ToggleVote } from "./schema";
import { Post } from "@prisma/client";

export type InputType = z.infer<typeof ToggleVote>;
export type ReturnType = ActionState<InputType, Post>;
