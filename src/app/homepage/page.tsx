"use client";

import { useState } from "react";
import { useGetProductsQuery } from "@/redux/fetchApi/productApi";
import ProductList from "@/components/ProductList";
import PaginationComponent from "@/components/PaginationComponent";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 9;

  const { data, isLoading, isError } = useGetProductsQuery({
    page: currentPage,
    limit,
  });
  const products = data?.products || [];
  const totalProducts = data?.total || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  if (isLoading) {
    return (
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
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-red-600">
          Unable to load products. Please try again later.
        </h2>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-9">
      <ProductList products={products} />
      {totalPages > 1 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
