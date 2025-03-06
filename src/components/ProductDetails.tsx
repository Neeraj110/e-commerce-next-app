import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

interface ProductDetailsProps {
  product: {
    title: string;
    price: number;
    description: string;
    categories: string[];
    rating: { rate: number; count: number };
  };
}

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.round(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
        }`}
      />
    ))}
  </div>
);

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const { title, price, description, categories, rating } = product;

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="capitalize px-2 py-1 text-xs sm:text-sm"
            >
              {category}
            </Badge>
          ))}
        </div>
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
          {title}
        </h1>
        <div className="flex items-center gap-2">
          <RatingStars rating={rating.rate} />
          <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            ({rating.count} reviews)
          </span>
        </div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-bold text-primary">
            ₹{price}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            inclusive of all taxes
          </span>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="space-y-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg">
        <h3 className="text-lg sm:text-xl font-semibold">
          Product Description
        </h3>
        <p className="leading-relaxed text-sm sm:text-base text-gray-600 dark:text-gray-300 whitespace-pre-line">
          {description}
        </p>
      </div>
    </>
  );
};
