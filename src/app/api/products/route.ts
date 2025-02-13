import { NextResponse, NextRequest } from "next/server";
import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";
import { adminAuthMiddleware } from "@/utils/adminAuth";
import { uploadOnCloudinary } from "@/config/cloudinary";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const query: any = {};

    if (category) {
      query.categories = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const productsPromise = Product.find(query)
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean();

    const totalPromise = Product.countDocuments(query);

    const [products, total] = await Promise.all([
      productsPromise,
      totalPromise,
    ]);

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

    // Get FormData from request
    const formData = await req.formData();

    // Extracting fields from FormData
    const title = formData.get("title") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const categories = formData.getAll("categories") as string[];
    const stock = parseInt(formData.get("stock") as string);
    const specifications = formData.getAll("specifications") as string[];
    const imageFiles: File[] = formData.getAll("images") as File[];

    // Connect to Database
    await connectDb();

    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      imageFiles.map(async (image) => {
        const result = await uploadOnCloudinary(image);
        return { url: result.url, public_id: result.public_id };
      })
    );

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
