"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  useGetReviewQuery,
  useAddReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from "@/redux/fetchApi/productApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingSummary } from "./RatingSummary";
import { ReviewForm } from "./ReviewForm";
import { ReviewCard } from "./ReviewCard";

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

interface ProductReviewsProps {
  rating: { rate: number; count: number };
  productId: string;
}

export const ProductReviews = ({ rating, productId }: ProductReviewsProps) => {
  const { data: session } = useSession();
  const [isAddReviewDialogOpen, setIsAddReviewDialogOpen] = useState(false);
  const [isEditReviewDialogOpen, setIsEditReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const {
    data: reviewsData,
    isLoading,
    isError,
  } = useGetReviewQuery(productId);
  const [addReview, { isLoading: isAdding }] = useAddReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();

  const reviews: Review[] = reviewsData ?? [];

  const isReviewOwner = useCallback(
    (review: Review) => session?.user?.email === review.user.email,
    [session]
  );

  const handleSubmitReview = useCallback(
    async (values: { rating: number; comment: string; images: File[] }) => {
      if (!session) {
        toast.error("Please log in to submit a review");
        return;
      }
      const formData = new FormData();
      formData.append("rating", values.rating.toString());
      formData.append("comment", values.comment);
      values.images.forEach((image) => formData.append("images", image));

      try {
        await addReview({ formdata: formData, id: productId }).unwrap();
        toast.success("Review submitted successfully");
        setIsAddReviewDialogOpen(false);
      } catch (error: any) {
        toast.error(error.data?.error || "Failed to submit review");
      }
    },
    [addReview, productId, session]
  );

  const handleUpdateReview = useCallback(
    async (values: { rating: number; comment: string; images: File[] }) => {
      if (!session || !editingReview || !isReviewOwner(editingReview)) {
        toast.error("Unauthorized to update this review");
        return;
      }
      const formData = new FormData();
      formData.append("rating", values.rating.toString());
      formData.append("comment", values.comment);
      formData.append("reviewId", editingReview._id);
      values.images.forEach((image) => formData.append("images", image));

      try {
        await updateReview({ formdata: formData, id: productId }).unwrap();
        toast.success("Review updated successfully");
        setIsEditReviewDialogOpen(false);
        setEditingReview(null);
      } catch (error: any) {
        toast.error(error.data?.message || "Failed to update review");
      }
    },
    [updateReview, productId, session, editingReview, isReviewOwner]
  );

  const handleDeleteReview = useCallback(
    async (review: Review) => {
      if (!isReviewOwner(review)) {
        toast.error("Unauthorized to delete this review");
        return;
      }
      if (!confirm("Are you sure you want to delete this review?")) return;

      try {
        await deleteReview({
          data: { reviewId: review._id },
          id: productId,
        }).unwrap();
        toast.success("Review deleted successfully");
      } catch (error: any) {
        toast.error(error.data?.message || "Failed to delete review");
      }
    },
    [deleteReview, productId, isReviewOwner]
  );

  const openEditDialog = useCallback(
    (review: Review) => {
      if (!isReviewOwner(review)) {
        toast.error("You can only edit your own reviews");
        return;
      }
      setEditingReview(review);
      setIsEditReviewDialogOpen(true);
    },
    [isReviewOwner]
  );

  if (isLoading)
    return (
      <div className="mt-10 lg:mt-16 space-y-4">
        <Skeleton className="h-8 w-48 rounded-md" />
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="lg:col-span-4 h-48 rounded-xl" />
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="mt-10 lg:mt-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Customer Reviews</h2>
        <Dialog
          open={isAddReviewDialogOpen}
          onOpenChange={setIsAddReviewDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-3 sm:mt-0 text-sm">
              Write a Review
            </Button>
          </DialogTrigger>
          <ReviewForm
            onSubmit={handleSubmitReview}
            isLoading={isAdding}
            title="Write a Review"
            submitText="Submit Review"
          />
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 mb-8">
        <RatingSummary rating={rating} reviews={reviews} />
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                isReviewOwner={isReviewOwner}
                handleDeleteReview={handleDeleteReview}
                openEditDialog={openEditDialog}
                isDeleting={isDeleting}
                isUpdating={isUpdating}
              />
            ))
          )}
        </div>
      </div>

      <Dialog
        open={isEditReviewDialogOpen}
        onOpenChange={setIsEditReviewDialogOpen}
      >
        {editingReview && (
          <ReviewForm
            initialRating={editingReview.rating}
            initialComment={editingReview.comment}
            onSubmit={handleUpdateReview}
            isLoading={isUpdating}
            title="Edit Review"
            submitText="Update Review"
          />
        )}
      </Dialog>
    </div>
  );
};
