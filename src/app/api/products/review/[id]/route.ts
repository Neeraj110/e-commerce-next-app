import Product from "@/models/product.model";
import connectDb from "@/config/connectDb";
import { NextRequest, NextResponse } from "next/server";
import Review from "@/models/reviews.model";
import { uploadOnCloudinary, deleteFromCloudinary } from "@/config/cloudinary";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOption";
import User from "@/models/user.model";

interface RouteContext {
  params: {
    id: string;
  };
}

interface IImage {
  url: string;
  public_id: string;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Not Authenticated" },
        { status: 401 }
      );
    }

    const productId = context.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Not Authenticated" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const productId = context.params.id;
    const formData = await req.formData();

    const rating = Number(formData.get("rating"));
    const comment = formData.get("comment") as string;
    const images = formData.getAll("images") as File[];

    if (!rating || !comment || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existingReview = await Review.findOne({
      user: user._id,
      product: productId,
    });
    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists" },
        { status: 400 }
      );
    }

    const uploadedImages: IImage[] = [];
    for (const image of images) {
      const result = await uploadOnCloudinary(image);
      if (result && result.url && result.public_id) {
        uploadedImages.push({ url: result.url, public_id: result.public_id });
      }
    }

    const review = await Review.create({
      user: user._id,
      product: productId,
      rating,
      comment,
      images: uploadedImages,
    });

    const allReviews = await Review.find({ product: productId });
    const avgRating =
      allReviews.reduce((acc, curr) => acc + curr.rating, 0) /
      allReviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: Number(avgRating.toFixed(1)),
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await connectDb();
    const formData = await req.formData();
    const reviewId = formData.get("reviewId") as string;
    const rating = Number(formData.get("rating"));
    const comment = formData.get("comment") as string;
    const userId = formData.get("userId") as string;
    const newImages = formData.getAll("images") as File[];

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await Review.findOne({
      _id: reviewId,
      product: context.params.id,
    });
    if (!review) {
      return NextResponse.json(
        { error: "Review not found or unauthorized" },
        { status: 404 }
      );
    }

    let updatedImages = [...(review.images || [])];
    if (newImages.length > 0) {
      for (const image of review.images) {
        if (image.public_id) await deleteFromCloudinary(image.public_id);
      }
      updatedImages = [];
      for (const image of newImages) {
        const result = await uploadOnCloudinary(image);
        if (result && result.url && result.public_id) {
          updatedImages.push({ url: result.url, public_id: result.public_id });
        }
      }
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { rating, comment, images: updatedImages },
      { new: true }
    ).populate("user", "name email");

    if (!updatedReview) {
      return NextResponse.json(
        { error: "Failed to update review" },
        { status: 400 }
      );
    }

    const allReviews = await Review.find({ product: context.params.id });
    const avgRating =
      allReviews.reduce((acc, curr) => acc + curr.rating, 0) /
      allReviews.length;
    await Product.findByIdAndUpdate(context.params.id, {
      rating: Number(avgRating.toFixed(1)),
    });

    return NextResponse.json(updatedReview);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectDb();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Not Authenticated" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { reviewId } = await req.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const review = await Review.findOne({
      _id: reviewId,
      user: user._id,
      product: context.params.id,
    });
    if (!review) {
      return NextResponse.json(
        { error: "Review not found or unauthorized" },
        { status: 404 }
      );
    }

    for (const image of review.images) {
      if (image.public_id) await deleteFromCloudinary(image.public_id);
    }

    await Review.findByIdAndDelete(reviewId);

    const allReviews = await Review.find({ product: context.params.id });
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) /
          allReviews.length
        : 0;
    await Product.findByIdAndUpdate(context.params.id, {
      rating: Number(avgRating.toFixed(1)),
    });

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
