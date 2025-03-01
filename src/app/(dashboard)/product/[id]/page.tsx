"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/slices/cartSlice";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useGetSingleProductQuery } from "@/redux/fetchApi/productApi";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAddcartMutation } from "@/redux/fetchApi/cartApi";

const mockReviews = [
  {
    id: 1,
    user: "John Doe",
    rating: 5,
    date: "2024-02-15",
    comment: "Excellent product! Exactly what I was looking for.",
    helpful: 12,
    unhelpful: 2,
  },
  {
    id: 2,
    user: "Jane Smith",
    rating: 4,
    date: "2024-02-10",
    comment: "Good quality but shipping took longer than expected.",
    helpful: 8,
    unhelpful: 1,
  },
  {
    id: 3,
    user: "Mike Johnson",
    rating: 5,
    date: "2024-02-05",
    comment: "Perfect fit and great value for money!",
    helpful: 15,
    unhelpful: 3,
  },
];

export default function ProductPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const { data, isLoading, isError } = useGetSingleProductQuery(id as string);
  const router = useRouter();
  const [addCart] = useAddcartMutation();
  const [showActionButtons, setShowActionButtons] = useState(false);

  const product = data?.product || null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg font-semibold">Loading product...</div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg font-semibold text-red-500">
          Product not found
        </div>
      </div>
    );
  }

  const image = product.images?.[0]?.url || "/placeholder.svg";
  const categories = product.categories?.join(", ") || "Unknown";
  const { _id, title, price, description, images, stock, rating } = product;

  const handleAddToCart = async () => {
    await addCart({ productId: _id, quantity: 1 });
  };

  const features = [
    { icon: <Truck className="h-5 w-5" />, text: "Free Delivery" },
    { icon: <ShieldCheck className="h-5 w-5" />, text: "1 Year Warranty" },
    { icon: <RefreshCw className="h-5 w-5" />, text: "7 Days Return" },
  ];

  const RatingStars = ({ rating }: any) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
          }`}
        />
      ))}
    </div>
  );

  const handleBuyNow = () => {
    if (session) {
      router.push("/checkout");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-16 sm:mt-20">
      {/* Back button header */}
      <div className="flex h-12 sm:h-16 items-center px-3 sm:px-4 md:px-6 lg:px-8 border-b dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 sm:gap-2 hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-sm sm:text-base md:text-lg font-medium">
            Back
          </span>
        </button>
      </div>

      <main className="px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-2 ">
              <CardContent className="p-1 sm:p-2 md:p-4">
                <div className="relative aspect-square rounded-lg bg-white dark:bg-gray-800">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-4"
                    priority
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details Section */}
          <div className="space-y-6 lg:px-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {categories.split(",").map((category: any) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="capitalize px-2 py-1 text-xs sm:text-sm"
                  >
                    {category.trim()}
                  </Badge>
                ))}
              </div>
              <h1 className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
                {title}
              </h1>

              <div className="flex items-center gap-2">
                <RatingStars rating={rating?.rate || 0} />
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  ({rating?.count || 0} reviews)
                </span>
              </div>

              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  ₹{price}
                </span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  inclusive of all taxes
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Features Section */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                >
                  <div className="mb-2 rounded-full bg-primary/10 p-2 text-primary">
                    {feature.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-medium">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Actions */}
            <div className="flex gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
              {session ? (
                <Button
                  size="default"
                  className="flex-1 text-sm sm:text-base py-4 sm:py-6 min-w-24"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              ) : (
                <Link href="/login" className="flex-1">
                  <Button
                    size="default"
                    className="w-full text-sm sm:text-base py-4 sm:py-6"
                  >
                    Login to Add
                  </Button>
                </Link>
              )}
              {/* <Button
                size="default"
                className="flex-1 text-sm sm:text-base py-4 sm:py-6 min-w-24"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button> */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12"
                >
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12"
                >
                  <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Description */}
            <div className="space-y-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg">
              <h3 className="text-lg sm:text-xl font-semibold">
                Product Description
              </h3>
              <p className="leading-relaxed text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-10 lg:mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Customer Reviews</h2>
            <Button variant="outline" className="mt-3 sm:mt-0 text-sm">
              Write a Review
            </Button>
          </div>

          {/* Reviews Summary */}
          <div className="grid gap-6 lg:grid-cols-12 mb-8">
            <Card className="lg:col-span-4 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
                  {rating?.rate || 0}
                </div>
                <RatingStars rating={rating?.rate || 0} />
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Based on {rating?.count || 0} reviews
                </p>

                <div className="w-full mt-6 sm:mt-8 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm w-6 sm:w-8">
                        {star} ★
                      </span>
                      <div className="flex-1 h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{
                            width: `${
                              (mockReviews.filter((r) => r.rating === star)
                                .length /
                                mockReviews.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Reviews List */}
            <div className="lg:col-span-8">
              <div className="space-y-4 sm:space-y-6">
                {mockReviews.map((review) => (
                  <Card
                    key={review.id}
                    className="p-4 sm:p-6 lg:p-8 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-base sm:text-lg font-semibold text-primary">
                              {review.user.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">
                              {review.user}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              {review.date}
                            </p>
                          </div>
                        </div>
                        <div>
                          <RatingStars rating={review.rating} />
                          <p className="mt-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 pt-3 border-t dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8"
                      >
                        <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Helpful ({review.helpful})</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8"
                      >
                        <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Not Helpful ({review.unhelpful})</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
