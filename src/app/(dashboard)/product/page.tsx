"use client";
import React, { useState } from "react";
import { useGetProductsQuery } from "@/redux/fetchApi/productApi";
import ProductList from "@/components/ProductList";
import PaginationComponent from "@/components/PaginationComponent";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import SideBar from "@/components/SideBar";
import { Button } from "@/components/ui/button";
import { debouncedSearchQuery } from "@/utils/debouceSearch";

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 80000]);
  const limit = 13;

  const debouncedQuery = debouncedSearchQuery(searchQuery || "", 400);

  const { data, isLoading, isError } = useGetProductsQuery({
    page: currentPage,
    limit,
    category: selectedCategory,
    search: debouncedQuery,
    price: priceRange.join(","),
  });

  const products = data?.products || [];
  const totalProducts = data?.total || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSearch = (search: string) => {
    setSearchQuery(search);
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  return (
    <div className="flex">
      <SideBar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
      />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-9">
        <Button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden mb-4"
        >
          Toggle Filters
        </Button>
        <input
          type="text"
          placeholder="Search products..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
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
            {products.length === 0 ? (
              <div className="p-4 text-center">
                <h2 className="text-xl font-semibold text-gray-600">
                  No products found.
                </h2>
              </div>
            ) : (
              <ProductList products={products} />
            )}
            {totalPages > 1 && (
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
