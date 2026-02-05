import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findSimilarPosts } from "@/lib/similar-posts";

const RequestSchema = z.object({
  title: z.string().min(5).max(200),
  boardId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { title, boardId } = parsed.data;

    const similarPosts = await findSimilarPosts(title, boardId, {
      limit: 5,
      threshold: 0.3,
    });

    return NextResponse.json(similarPosts);
  } catch (error) {
    console.error("[similar-posts] Error:", error);
    return NextResponse.json(
      { error: "Failed to search similar posts" },
      { status: 500 },
    );
  }
}
