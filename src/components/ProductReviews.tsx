import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
      />
    ))}
  </div>
);

export default function ProductReviews({ rating }: { rating: { rate: number; count: number } }) {
  return (
    <div className="mt-16 lg:mt-24">
      <h2 className="text-2xl font-bold lg:text-3xl">Customer Reviews</h2>
      <Card className="p-6 lg:p-8 mt-4 text-center">
        <div className="text-5xl font-bold mb-4">{rating?.rate || 0}</div>
        <RatingStars rating={rating?.rate || 0} />
        <p className="text-sm text-gray-600 mt-3">Based on {rating?.count || 0} reviews</p>
      </Card>
    </div>
  );
}
