"use client";
import { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";

interface ReviewFormProps {
  initialRating?: number;
  initialComment?: string;
  onSubmit: (values: {
    rating: number;
    comment: string;
    images: File[];
  }) => void;
  isLoading: boolean;
  title: string;
  submitText: string;
}

export const ReviewForm = ({
  initialRating = 5,
  initialComment = "",
  onSubmit,
  isLoading,
  title,
  submitText,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>(
    {}
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { rating?: string; comment?: string } = {};
    if (rating < 1 || rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5";
    }
    if (comment.length < 10) {
      newErrors.comment = "Comment must be at least 10 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSubmit({ rating, comment, images });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          {errors.rating && (
            <p className="text-red-500 text-sm">{errors.rating}</p>
          )}
        </div>
        <div>
          <Label htmlFor="comment">Comment</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review here..."
          />
          {errors.comment && (
            <p className="text-red-500 text-sm">{errors.comment}</p>
          )}
        </div>
        <div>
          <Label htmlFor="images">Upload Images (optional)</Label>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : submitText}
        </Button>
      </form>
    </DialogContent>
  );
};
