import { Star } from "lucide-react";
import { Card } from "./ui/card";

interface Review {
  _id: string;
  rating: number;
}

interface RatingSummaryProps {
  rating: { rate: number; count: number };
  reviews: Review[];
}

export const RatingSummary = ({ rating, reviews }: RatingSummaryProps) => (
  <Card className="lg:col-span-4 p-4 sm:p-6 lg:p-8">
    <div className="flex flex-col items-center text-center">
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
        {rating.rate}
      </div>
      <RatingStars rating={rating.rate} />
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
        Based on {rating.count} reviews
      </p>
      <div className="w-full mt-6 sm:mt-8 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center gap-2">
            <span className="text-xs sm:text-sm w-6 sm:w-8">{star} ★</span>
            <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400"
                style={{
                  width: `${
                    (reviews.filter((r) => r.rating === star).length /
                      reviews.length) *
                      100 || 0
                  }%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

export const RatingStars = ({ rating }: { rating: number }) => (
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
