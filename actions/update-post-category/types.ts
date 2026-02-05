import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { UpdatePostCategory } from "./schema";
import { Post } from "@prisma/client";

export type InputType = z.infer<typeof UpdatePostCategory>;
export type ReturnType = ActionState<InputType, Post>;
