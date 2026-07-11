import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/config/connectDb";
import Product from "@/models/product.model";
import { generateEmbedding } from "@/utils/embeddings";
import { initPinecone, getPineconeIndex } from "@/config/pinecone";
import { adminAuthMiddleware } from "@/utils/adminAuth";

const INDEX_NAME = "products";

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await adminAuthMiddleware(req);
    if (adminCheck) return adminCheck;

    // Connect to the database
    await connectDb();

    // Initialize Pinecone
    await initPinecone(INDEX_NAME); // Ensure the index exists
    const index = getPineconeIndex(INDEX_NAME); // Get the Pinecone index

    // Fetch all products
    const products = await Product.find();

    if (!products.length) {
      return NextResponse.json(
        { success: false, message: "No products found" },
        { status: 404 }
      );
    }

    const embeddings = await Promise.all(
      products.map(async (product, index) => {
        try {
          const text = `${product.title || "Untitled"}. ${
            product.description || "No description"
          }. Categories: ${
            Array.isArray(product.categories) && product.categories.length
              ? product.categories.join(", ")
              : product.categories || "None"
          }. Price: ${product.price || "Unknown"}`;

          const embedding = await generateEmbedding(text);

          if (
            !embedding ||
            !Array.isArray(embedding) ||
            embedding.length === 0
          ) {
            throw new Error(`Invalid embedding for product ${product._id}`);
          }

          return {
            id: String(product._id),
            values: embedding,
            metadata: {
              title: product.title || "Untitled",
              description: product.description || "No description",
              ...(product.price !== null && product.price !== undefined
                ? { price: product.price }
                : {}),
              categories: Array.isArray(product.categories)
                ? product.categories
                : [product.categories || "None"],
              images: product.images?.map((img: any) => img.url) || [],
            },
          };
        } catch (error) {
          console.error(
            `Error generating embedding for product ${product._id}:`,
            error
          );
          return null; 
        }
      })
    );

    // Filter out any null entries (failed embeddings)
    const validEmbeddings = embeddings.filter((emb) => emb !== null);
    console.log(
      `Generated ${validEmbeddings.length} valid embeddings out of ${products.length} products`
    );

    if (validEmbeddings.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid embeddings generated" },
        { status: 400 }
      );
    }

    // Step 2: Batch upload to Pinecone
    const batchSize = 20;
    for (let i = 0; i < validEmbeddings.length; i += batchSize) {
      const batch = validEmbeddings.slice(i, i + batchSize);
      try {
        await index.upsert(batch); // Upload batch to Pinecone
      } catch (batchError) {
        console.error(
          `Error uploading batch ${i / batchSize + 1}:`,
          batchError
        );
        return NextResponse.json(
          {
            success: false,
            message: `Failed to upload batch ${i / batchSize + 1}`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Indexed ${validEmbeddings.length} products successfully`,
      count: validEmbeddings.length,
    });
  } catch (error: any) {
    console.error("Indexing Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
