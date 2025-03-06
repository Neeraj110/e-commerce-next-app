import { NextResponse, NextRequest } from "next/server";
import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import { uploadOnCloudinary, deleteFromCloudinary } from "@/config/cloudinary";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 12);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const price = searchParams.get("price");

    const query: any = {};

    if (category && category !== "null") {
      query.categories = category;
    }

    if (price && price !== "null") {
      const [min, max] = price.split(",").map((p) => parseInt(p, 10));
      query.price = { $gte: min, $lte: max };
    }

    if (search && search !== "null") {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const productsPromise = Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean();

    const totalPromise = Product.countDocuments(query);

    const [products, total] = await Promise.all([
      productsPromise,
      totalPromise,
    ]);

    for (const product of products) {
      if (product.stock === 0 && product.images.length > 0) {
        product.images.map(async (image: any) => {
          await deleteFromCloudinary(image.public_id);
        });
        await Product.findByIdAndDelete(product._id);
      }
    }

    return NextResponse.json({ products, total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Admin Check
    const adminCheck = await adminAuthMiddleware(req);
    if (adminCheck) return adminCheck;

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const categories = formData.getAll("categories") as string[];
    const stock = parseInt(formData.get("stock") as string);

    const specifications: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      const match = key.match(/^specifications\[(.*?)\]$/);
      if (match) {
        specifications[match[1]] = value as string;
      }
    }

    const imageFiles: File[] = formData.getAll("images") as File[];

    if (
      !title ||
      !price ||
      !description ||
      !categories ||
      !stock ||
      !imageFiles
    ) {
      return NextResponse.json(
        { error: "Please fill all the fields" },
        { status: 400 }
      );
    }

    await connectDb();

    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      imageFiles.map(async (image) => {
        const result = await uploadOnCloudinary(image);
        return { url: result.url, public_id: result.public_id };
      })
    );

    if (!uploadedImages || uploadedImages.length === 0) {
      return NextResponse.json(
        { error: "Image Upload Failed" },
        { status: 500 }
      );
    }

    // Create Product Document
    const product = await Product.create({
      title,
      price,
      description,
      categories,
      images: uploadedImages,
      stock,
      specifications,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error("Product Creation Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
