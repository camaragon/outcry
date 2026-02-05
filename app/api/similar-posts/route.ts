import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findSimilarPosts } from "@/lib/similar-posts";

const RequestSchema = z.object({
  title: z.string().min(5).max(200),
  boardId: z.string().uuid(),
});

// Simple in-memory rate limiter: max 20 requests per IP per minute
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

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
