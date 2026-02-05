import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "[embeddings] OPENAI_API_KEY is not set — skipping embedding generation",
    );
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

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}
