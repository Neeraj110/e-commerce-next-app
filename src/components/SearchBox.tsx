"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useGetProductsQuery } from "@/redux/fetchApi/productApi";
import { IProduct } from "@/models/product.model";
import { debouncedSearchQuery } from "@/utils/debouceSearch";
import { useRouter } from "next/navigation";

interface SearchBoxProps {
  isDesktop?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({ isDesktop = false }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedQuery = debouncedSearchQuery(searchQuery, 400);
  const { data, isLoading } = useGetProductsQuery({ search: debouncedQuery });
  const products: IProduct[] = data?.products ?? [];

  // Memoize handleProductClick to prevent unnecessary re-renders
  const handleProductClick = useCallback(
    (product: IProduct) => {
      router.push(`/product/${product._id}`);
      setShowSuggestions(false);
      setSearchQuery("");
    },
    [router]
  );

  // Handle outside click with useCallback for performance
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Handle input change with memoization
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setShowSuggestions(!!e.target.value);
    },
    []
  );

  const containerClasses = isDesktop
    ? "hidden md:flex flex-1 max-w-md mx-8"
    : "p-4 border-t md:hidden bg-gray-700";

  return (
    <div className={containerClasses}>
      <div ref={searchRef} className="relative w-full">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <Input
          type="search"
          placeholder="Search products..."
          className="pl-10 w-full"
          value={searchQuery}
          onChange={handleInputChange}
          aria-label="Search products"
        />

        {showSuggestions && searchQuery && (
          <Card className="absolute mt-1 w-full max-h-64 overflow-y-auto z-50 shadow-lg">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : products.length > 0 ? (
              <ul className="py-2">
                {products.map((product) => (
                  <li
                    key={String(product._id)}
                    className="px-4 py-2  hover:border-2 cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => handleProductClick(product)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleProductClick(product)
                    }
                    tabIndex={0}
                    role="option"
                    aria-label={`Select ${product.title}`}
                  >
                    <div className="flex items-center gap-2">
                      {product.images?.[0]?.url && (
                        <span className="relative h-10 w-10 overflow-hidden rounded">
                          <Image
                            src={product.images[0].url}
                            alt={product.title}
                            className="object-cover"
                            fill
                            sizes="40px"
                            loading="lazy"
                          />
                        </span>
                      )}
                      <span className="text-sm truncate max-w-[200px]">
                        {product.title}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ₹{product.price}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No products found
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
