"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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

  const { data, isLoading } = useGetProductsQuery({
    search: debouncedQuery,
  });

  const products: IProduct[] = data?.products || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductClick = (product: IProduct) => {
    router.push(`/product/${product._id}`);
    setShowSuggestions(false);
    setSearchQuery("");
  };

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
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          // onFocus={() => setShowSuggestions(true)}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && searchQuery && products?.length > 0 && (
          <Card className="absolute mt-1 w-full max-h-64 overflow-y-auto z-50  shadow-lg">
            <ul className="py-2">
              {products.map((product) => (
                <li
                  key={product._id as string | number}
                  className="px-4 py-2 hover:border hover:border-[2px] cursor-pointer flex justify-between items-center"
                  onClick={() => handleProductClick(product)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleProductClick(product);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <div className="flex items-center gap-2">
                    {product.images && product.images[0] && (
                      <Image
                        src={product.images[0].url}
                        alt={product.title}
                        width={40}
                        height={40}
                        className="object-cover rounded"
                      />
                    )}
                    <span className="text-sm">{product.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ${product.price}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Loading state */}
        {isLoading && searchQuery && (
          <Card className="absolute mt-1 w-full p-4 text-center text-gray-500">
            Loading...
          </Card>
        )}

        {/* No results state */}
        {!isLoading &&
          showSuggestions &&
          searchQuery &&
          products.length === 0 && (
            <Card className="absolute mt-1 w-full p-4 text-center text-gray-500">
              No products found
            </Card>
          )}
      </div>
    </div>
  );
};

export default SearchBox;
