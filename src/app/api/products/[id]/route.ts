import { NextResponse, NextRequest } from "next/server";
import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";
import { isValidObjectId } from "mongoose";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import { uploadOnCloudinary, deleteFromCloudinary } from "@/config/cloudinary";

// get a single product
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

    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// update a product only for admin
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
      if (match) {
        specifications[match[1]] = value as string;
      }
    }

    const imageFiles: File[] = formData.getAll("images") as File[];
    const updateData: any = {};

    if (title) updateData.title = title;
    if (price !== undefined) updateData.price = price;
    if (description) updateData.description = description;
    if (categories.length > 0) updateData.categories = categories;
    if (stock !== undefined) updateData.stock = stock;
    if (Object.keys(specifications).length > 0) {
      updateData.specifications = specifications;
    }

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

    return NextResponse.json({ product: updatedProduct }, { status: 200 });
  } catch (error: any) {
    console.error("Product Update Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// delete a product only for admin
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

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
