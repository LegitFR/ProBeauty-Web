# Review System - Quick Start Guide

## 🎯 For Users

### How to Write a Review

1. **Complete a Service**

   - Book and complete an appointment at a salon

2. **Access Your Profile**

   - Click on your profile icon
   - Navigate to the "My Reviews" tab

3. **Find Completed Bookings**

   - Scroll to "Rate Your Recent Visits"
   - Find the service you want to review
   - Click "Write Review"

4. **Submit Your Review**
   - Select a star rating (1-5)
   - Optionally add a comment (up to 1000 characters)
   - Click "Submit Review"

### How to Edit or Delete a Review

1. Go to Profile > My Reviews
2. Find your review
3. Click the pencil icon to edit or trash icon to delete
4. Make changes and save, or confirm deletion

### Where to See Reviews

- **Salon Booking Page**: At the bottom after selecting services
- **Your Profile**: "My Reviews" tab shows all your reviews

## 🔧 For Developers

### Quick Integration Example

```tsx
// Display reviews for a salon
import { ReviewsList } from "@/components/ReviewsList";

<ReviewsList salonId="salon_123" allowEdit={true} currentUserId={user.id} />;
```

```tsx
// Add review form
import { ReviewForm } from "@/components/ReviewForm";

<ReviewForm
  salonId="salon_123"
  serviceId="service_456"
  salonName="Glamour Studio"
  serviceName="Haircut"
  onSuccess={() => console.log("Review submitted!")}
  onCancel={() => console.log("Cancelled")}
/>;
```

```tsx
// Add reviews section to salon page
import { SalonReviewsSection } from "@/components/SalonReviewsSection";

<SalonReviewsSection
  salonId="salon_123"
  averageRating={4.5}
  totalReviews={120}
/>;
```

### API Client Usage

```typescript
import {
  createReview,
  getReviewsBySalon,
  getMyReviews,
  updateReview,
  deleteReview,
} from "@/lib/api/review";

// Create a review
await createReview({
  salonId: "salon_123",
  serviceId: "service_456",
  rating: 5,
  comment: "Excellent service!",
});

// Get salon reviews
const response = await getReviewsBySalon("salon_123", 1, 10);
console.log(response.data); // Array of reviews
console.log(response.averageRating); // 4.5
console.log(response.pagination); // Pagination info

// Get my reviews
const myReviews = await getMyReviews(1, 10);

// Update a review
await updateReview("review_id", {
  rating: 4,
  comment: "Updated comment",
});

// Delete a review
await deleteReview("review_id");
```

### Backend Integration Checklist

Make sure your backend implements these endpoints:

- ✅ `POST /api/v1/reviews` - Create review
- ✅ `GET /api/v1/reviews/:id` - Get review
- ✅ `GET /api/v1/reviews/salon/:salonId` - Get salon reviews
- ✅ `GET /api/v1/reviews/user/me` - Get user's reviews
- ✅ `PATCH /api/v1/reviews/:id` - Update review
- ✅ `DELETE /api/v1/reviews/:id` - Delete review

### Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## 🎨 Customization

### Styling

All components use Tailwind CSS and shadcn/ui components. Modify the class names in:

- `components/ReviewForm.tsx`
- `components/ReviewsList.tsx`
- `components/SalonReviewsSection.tsx`

### Validation

Update validation rules in `lib/api/review.ts`:

- Maximum comment length (currently 1000 chars)
- Rating range (currently 1-5)

## 🐛 Troubleshooting

### Reviews not showing?

- Check API connection in browser console
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Ensure backend endpoints are running

### Can't submit review?

- Verify user is authenticated
- Check salon and service IDs are valid
- Look for validation errors in toast notifications

### Edit/Delete buttons not showing?

- Ensure `currentUserId` matches review owner
- Check `allowEdit` prop is set to `true`

## 📱 Mobile Responsiveness

All components are fully responsive and work on:

- Mobile phones (< 640px)
- Tablets (640px - 1024px)
- Desktop (> 1024px)

## 🔐 Security

- Authentication required for creating, editing, and deleting reviews
- Users can only modify their own reviews
- All API calls are protected with JWT tokens
- Input validation on both client and server

## 🚀 Performance Tips

1. **Pagination**: Keep limit to 10-20 reviews per page
2. **Lazy Loading**: Reviews load only when tab/section is visible
3. **Caching**: Consider caching salon reviews on the client
4. **Debouncing**: Comment input uses controlled components efficiently

## 📊 Analytics Suggestions

Track these metrics for insights:

- Review submission rate
- Average rating per salon
- Most reviewed services
- Time to first review after booking
- Edit/delete frequency

## 🔄 Future Enhancements

Ideas for expansion:

1. Image uploads with reviews
2. Helpful/not helpful votes
3. Salon owner responses
4. Review moderation
5. Verified booking badges
6. Review reminders via email
