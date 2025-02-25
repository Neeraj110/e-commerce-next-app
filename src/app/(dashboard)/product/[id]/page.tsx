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
              : "fill-gray-200 text-gray-200"
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
    <div className="min-h-screen bg-gray-50">
      <div className=" flex h-16 items-center px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80">
          <ArrowLeft className="h-7 w-7" />
          <span className="text-xl font-medium">Back to Shop</span>
        </Link>
      </div>

      <main className=" px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-2">
              <CardContent className="p-2 md:p-4">
                <div className="relative aspect-square rounded-lg bg-white">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="100%"
                    className="object-contain p-4"
                    priority
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details Section */}
          <div className="space-y-8 lg:px-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.split(",").map((category: any) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="capitalize px-3 py-1"
                  >
                    {category.trim()}
                  </Badge>
                ))}
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl xl:text-5xl">
                {title}
              </h1>

              <div className="flex items-center gap-3">
                <RatingStars rating={rating?.rate || 0} />
                <span className="text-sm font-medium text-gray-600">
                  ({rating?.count || 0} reviews)
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary lg:text-4xl">
                  ₹{price}
                </span>
                <span className="text-sm text-gray-500">
                  inclusive of all taxes
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Features Section */}
            <div className="grid grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm"
                >
                  <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Actions */}
            <div className="flex gap-4">
              {session ? (
                <Button
                  size="lg"
                  className="flex-1 text-lg py-6"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              ) : (
                <Link href="/login">
                  <Button size="lg" className="flex-1 text-lg py-6">
                    Login to Add to Cart
                  </Button>
                </Link>
              )}
              <Button
                size="lg"
                className="flex-1 text-lg py-6"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Heart className="h-6 w-6" />
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Share2 className="h-6 w-6" />
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Description */}
            <div className="space-y-3 bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold">Product Description</h3>
              <p className="leading-relaxed text-gray-600">{description}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 lg:mt-24">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <h2 className="text-2xl font-bold lg:text-3xl">Customer Reviews</h2>
            <Button variant="outline" className="mt-4 lg:mt-0">
              Write a Review
            </Button>
          </div>

          {/* Reviews Summary */}
          <div className="grid gap-8 lg:grid-cols-12 mb-12">
            <Card className="lg:col-span-4 p-6 lg:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="text-5xl font-bold mb-4">
                  {rating?.rate || 0}
                </div>
                <RatingStars rating={rating?.rate || 0} />
                <p className="text-sm text-gray-600 mt-3">
                  Based on {rating?.count || 0} reviews
                </p>

                <div className="w-full mt-8 space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm w-8">{star} ★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
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

            <div className="lg:col-span-8">
              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <Card
                    key={review.id}
                    className="p-6 lg:p-8 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">
                              {review.user.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{review.user}</h4>
                            <p className="text-sm text-gray-600">
                              {review.date}
                            </p>
                          </div>
                        </div>
                        <div>
                          <RatingStars rating={review.rating} />
                          <p className="mt-3 text-gray-700 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Helpful ({review.helpful})</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ThumbsDown className="h-4 w-4" />
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
