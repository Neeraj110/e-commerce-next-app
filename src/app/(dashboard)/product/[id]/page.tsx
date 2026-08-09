"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useDeleteProductMutation,
  useGetSingleProductQuery,
} from "@/redux/fetchApi/productApi";
import { ProductImages } from "@/components/ProductImages";
import { ProductDetails } from "@/components/ProductDetails";
import { ProductFeatures } from "@/components/ProductFeatures";
import { ProductActions } from "@/components/ProductActions";
import { ProductReviews } from "@/components/ProductReviews";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";

interface Product {
  specifications: Record<string, string>;
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
  const { currentUser } = useSelector((state: RootState) => state.user);
  const isAdmin = currentUser?.role === "admin";
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading, isError } = useGetSingleProductQuery(id as string);
  const [deleteProduct, { isLoading: isDeletingAdmin }] =
    useDeleteProductMutation();

  const product = data?.product as Product | null;

  const handleEditRedirect = useCallback(() => {
    router.push(`/admin/product/${id}`);
  }, [id, router]);

  const handleDelete = useCallback(async () => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct({ id }).unwrap();
        toast.success("Product deleted successfully");
        router.push("/product");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  }, [id, deleteProduct, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background mt-16 sm:mt-20">
        <div className="px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <Skeleton className="h-[350px] sm:h-[450px] w-full rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4 rounded-lg" />
              <Skeleton className="h-6 w-1/4 rounded-md" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
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
      <header className="flex h-12 sm:h-16 items-center px-3 sm:px-4 md:px-6 lg:px-8 border-b dark:border-gray-800 justify-between">
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

        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleEditRedirect}
              className="text-sm sm:text-base"
            >
              Edit Product
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-1 sm:gap-2"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Delete</span>
            </Button>
          </div>
        )}
      </header>

      <main className="px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <ProductImages images={product.images} title={product.title} />
          <div className="space-y-6 lg:px-4">
            <ProductDetails product={product} />
            <ProductFeatures />
            <ProductActions productId={product._id} stock={product.stock} />
            {product.specifications && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Specifications</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <li key={key}>
                        <span className="font-medium">{key}: </span>
                        {value}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
        <ProductReviews rating={product.rating} productId={product._id} />
      </main>
    </div>
  );
}
