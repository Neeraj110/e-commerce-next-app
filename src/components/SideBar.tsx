"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SlidersHorizontal, X } from "lucide-react";
import { useGetCategoryQuery } from "@/redux/fetchApi/productApi";
import { cn } from "@/lib/utils";

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice?: number;
}

const FilterContent = ({
  selectedCategory,
  priceRange,
  onCategoryChange,
  onPriceRangeChange,
  maxPrice = 10000,
}: Omit<SideBarProps, "isOpen" | "onClose">) => {
  const { data, isLoading, isError } = useGetCategoryQuery({});
  const categories = data?.category || [];

  const handleCategoryChange = (category: string) => {
    if (selectedCategory === category) {
      onCategoryChange(null);
    } else {
      onCategoryChange(category);
    }
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
    <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
      {/* Category Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="space-y-3">
            {Array.isArray(categories) &&
              categories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <Checkbox
                    id={`category-${index}`}
                    checked={selectedCategory === category}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <label
                    htmlFor={`category-${index}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category}
                  </label>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Price Range</h3>
          <Slider
            value={priceRange}
            onValueChange={onPriceRangeChange}
            min={0}
            max={maxPrice}
            step={10}
            className="w-full"
          />
          <div className="mt-3 flex justify-between text-sm">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

function SideBar(props: SideBarProps) {
  const { isOpen, onClose } = props;

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-[340px] p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex justify-between items-center">
              Filters
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden text-xl"
              ></Button>
            </SheetTitle>
          </SheetHeader>
          <FilterContent {...props} />
          <SheetFooter className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                props.onCategoryChange(null);
                props.onPriceRangeChange([0, props.maxPrice || 10000]);
                onClose();
              }}
            >
              Reset Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:block w-64 border-r bg-background h-[calc(100vh-4rem)] sticky top-16",
          "overflow-hidden"
        )}
      >
        <div className="p-6 h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                props.onCategoryChange(null);
                props.onPriceRangeChange([0, props.maxPrice || 10000]);
              }}
              className="text-sm bg-black text-white p-[0.3rem] rounded"
            >
              Reset
            </Button>
          </div>
          <FilterContent {...props} />
        </div>
      </div>
    </>
  );
}

export default SideBar;
