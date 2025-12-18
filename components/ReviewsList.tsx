"use client";

import { useState, useEffect } from "react";
import { Star, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getReviewsBySalon, deleteReview } from "@/lib/api/review";
import { ReviewForm } from "./ReviewForm";
import type { Review } from "@/lib/types/review";

interface ReviewsListProps {
  salonId: string;
  allowEdit?: boolean;
  currentUserId?: string;
}

export function ReviewsList({
  salonId,
  allowEdit = false,
  currentUserId,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const fetchReviews = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await getReviewsBySalon(salonId, page, 10);
      setReviews(response.data);
      setAverageRating(response.averageRating || 0);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (error) {
      toast.error("Failed to load reviews");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [salonId]);

  const handleDelete = async () => {
    if (!selectedReview) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to delete review");
      return;
    }

    try {
      await deleteReview(token, selectedReview.id);
      toast.success("Review deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedReview(null);
      fetchReviews(currentPage);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete review"
      );
    }
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedReview(null);
    fetchReviews(currentPage);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-[#FF7A00] text-[#FF7A00]" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 bg-[#ECE3DC] border-2 border-[#1E1E1E]">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {total > 0 && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 fill-[#FF7A00] text-[#FF7A00]" />
            <span className="text-2xl font-bold text-black">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Based on {total} {total === 1 ? "review" : "reviews"}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="p-8 text-center bg-[#ECE3DC] border-2 border-[#1E1E1E]">
          <p className="text-gray-600 font-medium">
            No reviews yet. Be the first to review!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isOwner = allowEdit && currentUserId === review.userId;

            return (
              <Card
                key={review.id}
                className="p-6 bg-[#ECE3DC] border-2 border-[#1E1E1E]"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-black">
                          {review.user?.name}
                        </p>
                        {renderStars(review.rating)}
                      </div>
                      {review.service && (
                        <p className="text-sm text-gray-600">
                          Service: {review.service.title}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      {isOwner && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedReview(review);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedReview(review);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-sm leading-relaxed text-black">
                      {review.comment}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchReviews(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchReviews(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedReview && (
            <ReviewForm
              salonId={selectedReview.salonId}
              serviceId={selectedReview.serviceId || undefined}
              existingReview={selectedReview}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedReview(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedReview(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
