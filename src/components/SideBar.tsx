import React from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetCategoryQuery } from "@/redux/fetchApi/productApi";

interface SideBarProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice?: number;
  isInSheet?: boolean;
}

function SideBar({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  maxPrice = 20000,
  isInSheet = false,
}: SideBarProps) {
  const { data, isLoading, isError } = useGetCategoryQuery({});
  const categories = data?.category || [];

  const handleCategoryChange = (category: string) => {
    if (selectedCategory === category) {
      onCategoryChange(null);
    } else {
      onCategoryChange(category);
    }
  };

  const handleResetFilters = () => {
    onCategoryChange(null);
    onPriceRangeChange([0, maxPrice]);
  };

  if (isLoading) {
    return <div className="p-4">Loading categories...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Error loading categories. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isInSheet && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-sm bg-white text-gray-900 p-[10px] rounded"
          >
            Reset
          </Button>
        </div>
      )}

      <div>
        <h3 className="mb-4 text-sm font-medium">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={onPriceRangeChange}
          min={0}
          max={maxPrice}
          step={2}
          className="w-full"
        />
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium">Categories</h3>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 py-3">
          {Array.isArray(categories) &&
            categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  id={`category-${index}-${isInSheet ? "sheet" : "sidebar"}`}
                  checked={selectedCategory === category}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <label
                  htmlFor={`category-${index}-${
                    isInSheet ? "sheet" : "sidebar"
                  }`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
        </div>
      </div>

      {/* Reset button only in Sheet footer */}
      {isInSheet && (
        <div className="mt-8">
          <Button
            variant="outline"
            className="w-full text-sm bg-black text-white p-[0.3rem] rounded"
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default SideBar;
