import OpenAI from "openai";

let client: OpenAI | null = null;
let warnedMissingKey = false;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    if (!warnedMissingKey) {
      console.warn(
        "[embeddings] OPENAI_API_KEY is not set — skipping embedding generation",
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

export async function generateEmbedding(
  text: string,
): Promise<number[] | null> {
  const openai = getClient();
  if (!openai) return null;

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("[embeddings] Failed to generate embedding:", error);
    return null;
  }
}
