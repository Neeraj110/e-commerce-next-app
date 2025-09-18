import { NextResponse, NextRequest } from "next/server";
import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";
import { isValidObjectId } from "mongoose";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import { uploadOnCloudinary, deleteFromCloudinary } from "@/config/cloudinary";
import { setCache, getCache, invalidateCache } from "@/lib/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid product id" },
        { status: 400 }
      );
    }

    const cacheKey = `cache_product_${id}`;
    const cachedProduct = await getCache<{ product: any }>(cacheKey);
    if (cachedProduct) {
      console.log("⚡ Serving from Redis cache");
      return NextResponse.json(cachedProduct, { status: 200 });
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    await setCache(cacheKey, { product }, 3600);

    return NextResponse.json({ product }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await adminAuthMiddleware(req);
    if (adminCheck) return adminCheck;

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid product id" },
        { status: 400 }
      );
    }

    await connectDb();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const updateData: any = {};

    const title = formData.get("title") as string | null;
    const price = formData.get("price")
      ? parseFloat(formData.get("price") as string)
      : undefined;
    const description = formData.get("description") as string | null;
    const categories = formData.getAll("categories") as string[];
    const stock = formData.get("stock")
      ? parseInt(formData.get("stock") as string)
      : undefined;

    const specifications: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      const match = key.match(/^specifications\[(.*?)\]$/);
      if (match) specifications[match[1]] = value as string;
    }

    if (title) updateData.title = title;
    if (price !== undefined) updateData.price = price;
    if (description) updateData.description = description;
    if (categories.length > 0) updateData.categories = categories;
    if (stock !== undefined) updateData.stock = stock;
    if (Object.keys(specifications).length > 0) {
      updateData.specifications = specifications;
    }

    const imageFiles: File[] = formData.getAll("images") as File[];
    if (imageFiles.length > 0) {
      for (const image of product.images) {
        await deleteFromCloudinary(image.public_id);
      }

      const uploadedImages = await Promise.all(
        imageFiles.map(async (image) => {
          const result = await uploadOnCloudinary(image);
          return { url: result.url, public_id: result.public_id };
        })
      );

      updateData.images = uploadedImages;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    await invalidateCache(`cache_product_${id}`);
    await invalidateCache("cache_api_products*");

    return NextResponse.json({ product: updatedProduct }, { status: 200 });
  } catch (error: any) {
    console.error("Product Update Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await adminAuthMiddleware(req);
    if (adminCheck) return adminCheck;

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid product id" },
        { status: 400 }
      );
    }

    await connectDb();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    for (const image of product.images) {
      await deleteFromCloudinary(image.public_id);
    }

    await Product.findByIdAndDelete(id);

    await invalidateCache(`cache_product_${id}`);
    await invalidateCache("cache_api_products*");

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
