import { NextResponse } from "next/server";
import { generateEmbedding } from "@/utils/embeddings";
import { initPinecone, getPineconeIndex } from "@/config/pinecone";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Initialize Pinecone and get index
    await initPinecone("products");
    const index = getPineconeIndex("products");

    // Generate embedding for user query
    const userEmbedding = await generateEmbedding(message);

    if (!userEmbedding) {
      throw new Error("Failed to generate embedding");
    }

    // Query Pinecone for relevant products
    const queryResponse = await index.query({
      vector: userEmbedding as number[],
      topK: 5,
      includeMetadata: true,
    });

    const relevantProducts = queryResponse.matches.map((m: any) => m.metadata);

    // Prepare prompt for Gemini
    const prompt = `You are a knowledgeable and friendly e-commerce assistant designed to help customers find and learn about products in a clear, professional, and engaging manner. Your goal is to provide accurate, concise, and helpful responses that enhance the customer’s shopping experience.

### Responsibilities
- **Provide Accurate Information**: Use only the provided product data to answer questions about pricing, features, descriptions, categories, or other product details.
- **Make Relevant Recommendations**: Suggest up to two relevant products from the provided data when appropriate, based on the customer’s query or preferences.
- **Handle Unavailable Products**: If a customer asks about a product not in the provided data, politely inform them that the product is not available and offer to assist with similar products or other questions.
- **Be Concise and Clear**: Keep responses brief but informative, avoiding unnecessary details while ensuring the customer feels supported.
- **Maintain a Friendly Yet Professional Tone**: Use a warm, approachable tone that aligns with a premium e-commerce experience, similar to Apple’s customer-facing style.
- **Handle Edge Cases**: If the query is ambiguous, ask for clarification. If product data is incomplete (e.g., missing price or description), note the limitation and provide what’s available.

### Question
"${message}"

### Available Products
${relevantProducts
  .map(
    (p: any, i: number) =>
      `${i + 1}. ${p.title || "Unknown Product"}
   - Description: ${p.description || "No description available."}
   - Price: ${p.price ? `$${p.price}` : "Price not available."}
   - Categories: ${
     Array.isArray(p.categories) && p.categories.length > 0
       ? p.categories.join(", ")
       : p.categories || "No categories specified."
   }${p.availability ? `\n   - Availability: ${p.availability}` : ""}`,
  )
  .join("\n\n")}

### Response Format
Use the following structure for your response, adapting as needed based on the query:
1. **Greeting or Acknowledgment**: Start with a friendly greeting or acknowledgment of the customer’s question.
2. **Direct Answer**: Provide a clear, concise answer to the question, referencing specific product details when relevant.
3. **Product Details (if applicable)**: List relevant product information in a clean format (e.g., bullet points or a short paragraph).
4. **Recommendations (if relevant)**: Suggest up to two products with a brief explanation of why they’re a good fit.
5. **Closing**: Offer further assistance or invite additional questions in a friendly manner.

**Example Response**:
Hi there! Thanks for your question about wireless earbuds. Based on our available products, here’s what I found:

- **AirMax Pro Earbuds**: These offer noise cancellation and 8-hour battery life for $129.99. Perfect for immersive audio experiences.

**Recommendations**:
- **AirMax Lite**: A budget-friendly option at $79.99 with great sound quality.
- **SoundWave Headphones**: For over-ear comfort at $199.99.

Let me know if you’d like more details or help with something else!

### Additional Guidelines
- **Error Handling**: If the product data is malformed (e.g., missing title, price, or categories), use fallback text like "Unknown Product" or "Price not available."
- **Ambiguous Queries**: If the question is unclear, respond with a polite request for clarification (e.g., “Could you specify which product or feature you’re asking about?”).
- **Non-Product Queries**: For questions unrelated to products (e.g., shipping or store policies), politely explain that you can only assist with product-related inquiries and suggest contacting customer support.
- **Recommendations Logic**: Base recommendations on query keywords, price range, or categories. Avoid recommending the same product the customer asked about.
- **Markdown Formatting**: Use markdown (e.g., **bold**, - bullets) for clarity and readability in responses.

Please provide a helpful response based on the question and the available products above, following the specified format and guidelines.`;

    // Generate AI response
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const reply = response.text;

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chatbot Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Something went wrong",
        reply: "Sorry, I encountered an error. Please try again.",
      },
      { status: 500 },
    );
  }
}
