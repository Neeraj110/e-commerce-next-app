"use client";
import React, { useState, useEffect } from "react";
import { useGetProductsQuery } from "@/redux/fetchApi/productApi";
import ProductList from "@/components/ProductList";
import PaginationComponent from "@/components/PaginationComponent";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import SideBar from "@/components/SideBar";
import { Button } from "@/components/ui/button";
import { debouncedSearchQuery } from "@/utils/debouceSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const limit = 10;
  const [sortBy, setSortBy] = useState("featured");

  const debouncedPrice = debouncedSearchQuery(priceRange.join(","), 400);

  const { data, isLoading, isError } = useGetProductsQuery({
    page: currentPage,
    limit,
    category: selectedCategory,
    price: debouncedPrice,
  });
  const products = data?.products || [];
  const totalProducts = data?.total || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  const getSortedProducts = () => {
    if (!products.length) return [];

    let sorted = [...products];

    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
      default:
        sorted = [...products];
        break;
    }

    return sorted;
  };

  const sortedProducts = getSortedProducts();

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="min-h-screen mt-[4rem] sm:mt-20 md:mt-0 lg:mt-0 ">
      <main className="container px-2 sm:px-[1rem] md:px-6 grid gap-4 md:gap-8 pb-6 pt-3 sm:pt-4 md:pt-6 md:grid-cols-[220px_1fr] lg:gap-10">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block lg:block">
          <div className="sticky top-24">
            <SideBar
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6 sm:space-y-8">
          {/* Mobile Filter & Sort Controls */}
          <div className="flex items-center justify-between gap-2 sticky top-0 z-10 bg-background pt-2 pb-3 border-b">
            {/* Mobile Sheet Sidebar */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden lg:hidden flex items-center gap-1"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-md">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <SideBar
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  isInSheet={true}
                />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center justify-between px-[2rem]">
            {" "}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32 sm:w-40 h-9 text-xs sm:text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Best Rating</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {sortedProducts.length} of {totalProducts} products
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 ">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-40 sm:h-48 md:h-56 relative">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <CardHeader className="space-y-2 p-3 sm:p-4">
                    <Skeleton className="h-3 sm:h-4 w-2/3" />
                    <Skeleton className="h-3 sm:h-4 w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <div className="p-3 sm:p-4 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-red-600">
                Unable to load products. Please try again later.
              </h2>
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="p-3 sm:p-4 text-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-400">
                    No products found.
                  </h2>
                </div>
              ) : (
                <ProductList products={sortedProducts} isdes={true} />
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center pt-2 sm:pt-4">
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
