import OpenAI from "openai";

const openai = new OpenAI(); // uses OPENAI_API_KEY env var

export async function generateEmbedding(
  text: string,
): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "[embeddings] OPENAI_API_KEY is not set — skipping embedding generation",
    );
    return null;
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}
