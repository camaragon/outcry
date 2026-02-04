import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { UpdatePostStatus } from "./schema";
import { Post } from "@prisma/client";

export type InputType = z.infer<typeof UpdatePostStatus>;
export type ReturnType = ActionState<InputType, Post>;
