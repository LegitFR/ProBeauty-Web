"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, User, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getStaffReviews, type StaffReview } from "@/lib/api/staff";
import { toast } from "sonner";

interface StaffReviewsListProps {
  staffId: string;
  showTitle?: boolean;
}

export default function StaffReviewsList({
  staffId,
  showTitle = true,
}: StaffReviewsListProps) {
  const [reviews, setReviews] = useState<StaffReview[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadReviews = async (pageNum: number) => {
    try {
      setIsLoading(true);
      const response = await getStaffReviews(staffId, pageNum, 10);

      if (pageNum === 1) {
        setReviews(response.data || []);
      } else {
        setReviews((prev) => [...prev, ...(response.data || [])]);
      }

      setAverageRating(response.averageRating ?? null);
      setTotalRatings(response.totalRatings ?? 0);
      setHasMore(
        response.pagination
          ? response.pagination.page < response.pagination.totalPages
          : false,
      );
    } catch (error: any) {
      console.error("Error loading reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(1);
  }, [staffId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(nextPage);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B7355]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Average Rating */}
      {showTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#8B7355]">
              Customer Reviews
            </h2>
            {totalRatings > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-bold text-[#8B7355]">
                    {averageRating?.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-[#8B7355]/70">
                  Based on {totalRatings} review{totalRatings !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="border-[#D4C5B9] bg-[#ECE3DC]">
          <CardContent className="py-12 text-center">
            <Star className="h-12 w-12 text-[#8B7355]/30 mx-auto mb-4" />
            <p className="text-[#8B7355]/70">No reviews yet</p>
            <p className="text-sm text-[#8B7355]/50 mt-1">
              Be the first to review this staff member
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="border-[#D4C5B9] bg-[#ECE3DC] hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <Avatar className="h-12 w-12 border-2 border-[#8B7355]/20">
                    <AvatarImage
                      src={review.user?.image || undefined}
                      alt={review.user?.name || "User"}
                    />
                    <AvatarFallback className="bg-[#8B7355] text-[#ECE3DC]">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  {/* Review Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#8B7355]">
                          {review.user?.name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-[#8B7355]/20"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[#8B7355]/60">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-[#8B7355]/80 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outline"
                className="border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-[#ECE3DC]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Reviews"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
