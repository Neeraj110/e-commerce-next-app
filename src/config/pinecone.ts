// config/pinecone.ts
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const initPinecone = async (indexName: string) => {
  const existingIndexes = await pc.listIndexes();

  const indexExists = existingIndexes.indexes?.some(
    (index) => index.name === indexName
  );

  if (!indexExists) {
    await pc.createIndex({
      name: indexName,
      dimension: 3072, // Gemini embedding dimension
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
    console.log(`Index "${indexName}" created with 3072 dimensions ✅`);
  } else {
    console.log(`Index "${indexName}" already exists ✅`);
  }
};

export const getPineconeIndex = (indexName: string) => pc.Index(indexName);
