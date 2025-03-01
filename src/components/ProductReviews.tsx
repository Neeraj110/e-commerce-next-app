"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  useGetReviewQuery,
  useAddReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from "@/redux/fetchApi/productApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, ThumbsDown, Trash2, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";

// Schema for review form validation
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
  images: z.array(z.instanceof(File)).optional(),
});

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

  const reviews: Review[] = reviewsData || [];

  const addForm = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
      images: [],
    },
  });

  const editForm = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
      images: [],
    },
  });

  const handleSubmitReview = useCallback(
    async (values: z.infer<typeof reviewSchema>) => {
      if (!session) {
        toast.error("Please log in to submit a review");
        return;
      }

      const formData = new FormData();
      formData.append("rating", values.rating.toString());
      formData.append("comment", values.comment);
      if (values.images) {
        values.images.forEach((image) => formData.append("images", image));
      }

      try {
        await addReview({ formdata: formData, id: productId }).unwrap();
        toast.success("Review submitted successfully");
        setIsAddReviewDialogOpen(false);
        addForm.reset();
      } catch (error: any) {
        toast.error(error.data?.error || "Failed to submit review");
      }
    },
    [addReview, productId, session, addForm]
  );

  const handleUpdateReview = useCallback(
    async (values: z.infer<typeof reviewSchema>) => {
      if (!session || !editingReview) {
        toast.error("Unable to update review");
        return;
      }

      const formData = new FormData();
      formData.append("rating", values.rating.toString());
      formData.append("comment", values.comment);
      formData.append("reviewId", editingReview._id);
      if (values.images) {
        values.images.forEach((image) => formData.append("images", image));
      }

      try {
        await updateReview({ formdata: formData, id: productId }).unwrap();
        toast.success("Review updated successfully");
        setIsEditReviewDialogOpen(false);
        editForm.reset();
        setEditingReview(null);
      } catch (error: any) {
        toast.error(error.data?.error || "Failed to update review");
      }
    },
    [updateReview, productId, session, editingReview, editForm]
  );

  const handleDeleteReview = useCallback(
    async (reviewId: string) => {
      if (!confirm("Are you sure you want to delete this review?")) return;

      try {
        await deleteReview({
          data: { reviewId },
          id: productId,
        }).unwrap();
        toast.success("Review deleted successfully");
      } catch (error: any) {
        toast.error(error.data?.error || "Failed to delete review");
      }
    },
    [deleteReview, productId, session]
  );

  const openEditDialog = (review: Review) => {
    setEditingReview(review);
    editForm.reset({
      rating: review.rating,
      comment: review.comment,
      images: [],
    });
    setIsEditReviewDialogOpen(true);
  };

  if (isLoading) return <div>Loading reviews...</div>;
  if (isError) return <div>Error loading reviews</div>;

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>
            <Form {...addForm}>
              <form
                onSubmit={addForm.handleSubmit(handleSubmitReview)}
                className="space-y-4"
              >
                <FormField
                  control={addForm.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Write your review here..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Images (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            field.onChange(files);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 mb-8">
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
                  <span className="text-xs sm:text-sm w-6 sm:w-8">
                    {star} ★
                  </span>
                  <div className="flex-1 h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
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

        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <Card
                key={review._id}
                className="p-4 sm:p-6 lg:p-8 hover:shadow-md transition-shadow"
              >
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
                      {review.images && review.images.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {review.images.map((image, index) => (
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
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {session?.user.id  && (
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
                        onClick={() => handleDeleteReview(review._id)}
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
                    <span>Helpful ({review.helpful || 0})</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8"
                    disabled
                  >
                    <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Not Helpful ({review.unhelpful || 0})</span>
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Edit Review Dialog */}
      <Dialog
        open={isEditReviewDialogOpen}
        onOpenChange={setIsEditReviewDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdateReview)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Write your review here..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Upload New Images (optional, replaces existing)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          field.onChange(files);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Review"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
