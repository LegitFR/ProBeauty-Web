"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReviewsList } from "./ReviewsList";
import { getUser } from "@/lib/api/auth";

interface SalonReviewsSectionProps {
  salonId: string;
  averageRating?: number;
  totalReviews?: number;
}

export function SalonReviewsSection({
  salonId,
  averageRating = 0,
  totalReviews = 0,
}: SalonReviewsSectionProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const user = getUser();

  return (
    <>
      <Card className="shadow-lg rounded-md">
        <CardContent className="p-6 bg-[#ECE3DC]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-black">Customer Reviews</h3>
              {totalReviews > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-[#FF7A00] text-[#FF7A00]" />
                    <span className="text-lg font-bold text-black">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAllReviews(true)}
              className="shrink-0 border-2 border-[#1E1E1E] hover:bg-[#FF7A00] hover:text-white hover:border-[#FF7A00] font-semibold"
            >
              View All Reviews
            </Button>
          </div>

          {totalReviews === 0 && (
            <div className="text-center py-8 text-gray-600">
              <Star className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">No reviews yet</p>
              <p className="text-sm mt-1">Be the first to review this salon!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAllReviews} onOpenChange={setShowAllReviews}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#ECE3DC]">
          <DialogHeader>
            <DialogTitle>All Reviews</DialogTitle>
          </DialogHeader>
          <ReviewsList
            salonId={salonId}
            allowEdit={true}
            currentUserId={user?.id}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
