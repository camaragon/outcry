import OpenAI from "openai";
import { db } from "@/lib/db";

let client: OpenAI | null = null;
let warnedMissingKey = false;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    if (!warnedMissingKey) {
      console.warn(
        "[auto-categorize] OPENAI_API_KEY is not set — skipping auto-categorization",
      );
      warnedMissingKey = true;
    }
    return null;
  }
  if (!client) {
    client = new OpenAI();
  }
  return client;
}

interface AutoCategorizeResult {
  categoryId: string;
  categoryName: string;
}

/**
 * Use AI to suggest the best matching category for a post from the
 * workspace's existing categories. Returns null if no good match,
 * no categories exist, or the API is unavailable.
 */
export async function autoCategorize(
  title: string,
  body: string,
  workspaceId: string,
): Promise<AutoCategorizeResult | null> {
  const openai = getClient();
  if (!openai) return null;

  const categories = await db.category.findMany({
    where: { workspaceId },
    select: { id: true, name: true },
  });

  if (categories.length === 0) return null;

  const categoryList = categories
    .map((c) => `- "${c.name}" (id: ${c.id})`)
    .join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 100,
      messages: [
        {
          role: "system",
          content: `You are a feedback categorization assistant. Given a user feedback post and a list of available categories, respond with ONLY the category id that best matches the feedback. If none of the categories are a good fit, respond with exactly "none".

Available categories:
${categoryList}`,
        },
        {
          role: "user",
          content: `Title: ${title}\n\nBody: ${body}`,
        },
      ],
    });

    const answer = response.choices[0]?.message?.content?.trim();

    if (!answer || answer.toLowerCase() === "none") return null;

    const matched = categories.find((c) => c.id === answer);
    if (!matched) return null;

    return { categoryId: matched.id, categoryName: matched.name };
  } catch (error) {
    console.error("[auto-categorize] Failed to categorize post:", error);
    return null;
  }
}
