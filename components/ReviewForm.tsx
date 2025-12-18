"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createReview, updateReview } from "@/lib/api/review";
import type { Review } from "@/lib/types/review";

interface ReviewFormProps {
  salonId: string;
  serviceId?: string;
  productId?: string;
  salonName?: string;
  serviceName?: string;
  existingReview?: Review;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  salonId,
  serviceId,
  productId,
  salonName,
  serviceName,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to submit a review");
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        // Update existing review
        await updateReview(token, existingReview.id, {
          rating,
          comment: comment.trim() || undefined,
        });
        toast.success("Review updated successfully");
      } else {
        // Create new review
        await createReview(token, {
          salonId,
          serviceId,
          productId,
          rating,
          comment: comment.trim() || undefined,
        });
        toast.success("Review submitted successfully");
      }

      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit review"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </h3>
        {(salonName || serviceName) && (
          <p className="text-sm text-muted-foreground mt-1">
            {serviceName ? `${serviceName} at ` : ""}
            {salonName}
          </p>
        )}
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <Label htmlFor="rating">Rating *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-muted-foreground">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Your Review (Optional)</Label>
        <Textarea
          id="comment"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">
          {comment.length}/1000 characters
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting
            ? "Submitting..."
            : existingReview
            ? "Update Review"
            : "Submit Review"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
