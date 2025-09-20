
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { submitReview } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/star-rating';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !profile) {
      toast({ variant: 'destructive', title: 'You must be logged in to leave a review.' });
      return;
    }
    if (rating === 0) {
      toast({ variant: 'destructive', title: 'Please select a star rating.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview(productId, {
        userId: user.uid,
        userName: profile.name,
        rating,
        reviewText,
      });
      toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.' });
      onReviewSubmitted();
    } catch (error) {
      console.error("Failed to submit review", error);
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was an error submitting your review.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-8 rounded-2xl soft-shadow">
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StarRating rating={rating} onRatingChange={setRating} size={24} />
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Tell us what you think about the product..."
          rows={4}
          className="rounded-lg"
        />
        <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl soft-shadow">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
      </CardContent>
    </Card>
  );
}
