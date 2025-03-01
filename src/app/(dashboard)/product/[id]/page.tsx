"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGetSingleProductQuery } from "@/redux/fetchApi/productApi";
import { ProductImages } from "@/components/ProductImages";
import { ProductDetails } from "@/components/ProductDetails";
import { ProductFeatures } from "@/components/ProductFeatures";
import { ProductActions } from "@/components/ProductActions";
import { ProductReviews } from "@/components/ProductReviews";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  _id: string;
  title: string;
  price: number;
  description: string;
  images: { url: string }[];
  stock: number;
  rating: { rate: number; count: number };
  categories: string[];
}

export default function ProductPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading, isError } = useGetSingleProductQuery(id as string);

  const product = data?.product as Product | null;

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-16 sm:mt-20">
      <header className="flex h-12 sm:h-16 items-center px-3 sm:px-4 md:px-6 lg:px-8 border-b dark:border-gray-800">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-1 sm:gap-2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-sm sm:text-base md:text-lg font-medium">
            Back
          </span>
        </Button>
      </header>

      <main className="px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <ProductImages images={product.images} title={product.title} />
          <div className="space-y-6 lg:px-4">
            <ProductDetails product={product} />
            <ProductFeatures />
            <ProductActions productId={product._id} stock={product.stock} />
          </div>
        </div>
        <ProductReviews rating={product.rating} productId={product._id} />
      </main>
    </div>
  );
}
