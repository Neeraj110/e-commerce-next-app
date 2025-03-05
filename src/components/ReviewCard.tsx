// ReviewCard.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { RatingStars } from "./RatingSummary";
import Image from "next/image";
import { format } from "date-fns";

interface Review {
  _id: string;
  user: { name: string; email: string; _id: string };
  rating: number;
  comment: string;
  createdAt: string;
  images?: { url: string; public_id: string }[];
  helpful?: number;
  unhelpful?: number;
}

interface ReviewCardProps {
  review: Review;
  isReviewOwner: (review: Review) => boolean;
  handleDeleteReview: (review: Review) => void;
  openEditDialog: (review: Review) => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

export const ReviewCard = ({
  review,
  isReviewOwner,
  handleDeleteReview,
  openEditDialog,
  isDeleting,
  isUpdating,
}: ReviewCardProps) => (
  <Card className="p-4 sm:p-6 lg:p-8 hover:shadow-md transition-shadow">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-base sm:text-lg font-semibold text-primary">
              {review.user.name.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-sm sm:text-base">
              {review.user.name}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {format(new Date(review.createdAt), "PPP")}
            </p>
          </div>
        </div>
        <div>
          <RatingStars rating={review.rating} />
          <p className="mt-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {review.comment}
          </p>
          {(review.images?.length ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {review.images?.map((image, index) => (
                <div
                  key={index}
                  className="relative h-20 w-20 rounded-md overflow-hidden"
                >
                  <Image
                    src={image.url}
                    alt={`Review image ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isReviewOwner(review) && (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditDialog(review)}
            disabled={isUpdating || isDeleting}
            aria-label="Edit review"
          >
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteReview(review)}
            disabled={isDeleting}
            aria-label="Delete review"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )}
    </div>
    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 pt-3 border-t dark:border-gray-700">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8"
        disabled
      >
        <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
        <span>Helpful ({review.helpful ?? 0})</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8"
        disabled
      >
        <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
        <span>Not Helpful ({review.unhelpful ?? 0})</span>
      </Button>
    </div>
  </Card>
);
