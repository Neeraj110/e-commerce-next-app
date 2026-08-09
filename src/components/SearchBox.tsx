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
  className?: string;
  autoFocus?: boolean;
  onSelect?: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  className = "",
  autoFocus = false,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedQuery = debouncedSearchQuery(searchQuery, 400);
  const { data, isLoading } = useGetProductsQuery({ search: debouncedQuery });
  const products: IProduct[] = data?.products ?? [];

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleProductClick = useCallback(
    (product: IProduct) => {
      router.push(`/product/${product._id}`);
      setShowSuggestions(false);
      setSearchQuery("");
      if (onSelect) onSelect();
    },
    [router, onSelect]
  );

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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setShowSuggestions(!!e.target.value);
    },
    []
  );

  return (
    <div className={`relative w-full ${className}`}>
      <div ref={searchRef} className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search products..."
          className="h-10 w-full pl-9 pr-4 text-sm bg-background border-input focus:ring-2 focus:ring-primary/20"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(!!searchQuery)}
          aria-label="Search products"
        />

        {showSuggestions && searchQuery && (
          <Card className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto z-50 shadow-xl border bg-popover text-popover-foreground rounded-lg">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching products...
              </div>
            ) : products.length > 0 ? (
              <ul className="py-1 divide-y divide-border/40">
                {products.map((product) => (
                  <li
                    key={String(product._id)}
                    className="px-3 py-2.5 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between transition-colors text-sm"
                    onClick={() => handleProductClick(product)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleProductClick(product)
                    }
                    tabIndex={0}
                    role="option"
                    aria-label={`Select ${product.title}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {product.images?.[0]?.url && (
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
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
                      <span className="font-medium truncate max-w-[200px] sm:max-w-[300px]">
                        {product.title}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-primary shrink-0 ml-2">
                      ₹{product.price}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No products found for "{searchQuery}"
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
