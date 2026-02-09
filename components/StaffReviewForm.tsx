"use client";

import { useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createStaffReview, type CreateStaffReviewData } from "@/lib/api/staff";
import { getAccessToken } from "@/lib/api/auth";

interface StaffReviewFormProps {
  staffId: string;
  bookingId: string;
  staffName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StaffReviewForm({
  staffId,
  bookingId,
  staffName,
  onSuccess,
  onCancel,
}: StaffReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getAccessToken();
      if (!token) {
        toast.error("Please log in to submit a review");
        return;
      }

      const data: CreateStaffReviewData = {
        staffId,
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      };

      await createStaffReview(token, data);
      toast.success("Review submitted successfully!");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-[#D4C5B9] bg-[#ECE3DC]">
      <CardHeader className="border-b border-[#D4C5B9]/50">
        <CardTitle className="text-2xl text-[#8B7355]">
          Rate Your Experience with {staffName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-[#8B7355]">
              Your Rating *
            </Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-10 w-10 transition-all ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-[#8B7355]/30"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-lg font-semibold text-[#8B7355]">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label
              htmlFor="comment"
              className="text-base font-semibold text-[#8B7355]"
            >
              Your Review (Optional)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this staff member..."
              maxLength={1000}
              rows={5}
              className="resize-none border-[#D4C5B9] bg-white/50 focus:border-[#8B7355] focus:ring-[#8B7355] text-[#8B7355] placeholder:text-[#8B7355]/40"
            />
            <p className="text-sm text-[#8B7355]/60 text-right">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355]/10"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-[#8B7355] text-[#ECE3DC] hover:bg-[#6B5744] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
