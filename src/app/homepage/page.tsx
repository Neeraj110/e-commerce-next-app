"use client";

import { useState } from "react";
import { useGetProductsQuery } from "@/redux/fetchApi/productApi";
import ProductList from "@/components/ProductList";
import PaginationComponent from "@/components/PaginationComponent";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function HomePage() {
  const { data, isLoading, isError } = useGetProductsQuery({
    page: 1,
    limit: 9,
  });
  const products = data?.products || [];

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-9">
        {/* Hero Section with Background Color */}
        <section className="relative bg-gray-100 dark:bg-gray-900 ">
          <div className="container flex flex-col items-center justify-center space-y-4 py-24 text-center md:py-32">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Discover Our Latest Collection
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Shop the latest trends and find your perfect style. Free shipping
              on all orders over $50.
            </p>
          </div>
        </section>

        {/* Products Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 sm:h-64 relative">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardHeader className="space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold text-red-600">
              Unable to load products. Please try again later.
            </h2>
          </div>
        ) : (
          <>
            <ProductList products={products} />
            <Link href="/product">
              {" "}
              <p className="text-sm mt-8 hover:text-xl hover:underline font-bold text-center ">
                Show all products
              </p>
            </Link>
          </>
        )}
      </div>
    </>
  );
}
