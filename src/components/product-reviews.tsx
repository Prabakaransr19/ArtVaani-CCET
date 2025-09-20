
"use client";

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Review, ReviewStats } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/star-rating';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface ProductReviewsProps {
  productId: string;
  initialStats: ReviewStats;
}

export function ProductReviews({ productId, initialStats }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products', productId, 'reviews'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedReviews: Review[] = [];
      let totalRating = 0;
      querySnapshot.forEach((doc) => {
        const reviewData = { id: doc.id, ...doc.data() } as Review;
        fetchedReviews.push(reviewData);
        totalRating += reviewData.rating;
      });
      
      setReviews(fetchedReviews);
      if(fetchedReviews.length > 0) {
        setStats({
          reviewCount: fetchedReviews.length,
          averageRating: totalRating / fetchedReviews.length,
        });
      } else {
        setStats({ reviewCount: 0, averageRating: 0 });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="mt-12">
        <h2 className="text-2xl font-headline mb-4">Ratings & Reviews</h2>
        <Card className="rounded-2xl soft-shadow p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                    <p className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</p>
                    <StarRating rating={stats.averageRating} readonly size={20}/>
                    <p className="text-sm text-muted-foreground mt-1">({stats.reviewCount} reviews)</p>
                </div>
            </div>
            
            <Separator />

            <div className="space-y-6 mt-6">
                {loading ? (
                    <p>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <p className="text-muted-foreground">No reviews yet. Be the first to leave one!</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="flex gap-4">
                            <Avatar>
                                <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{review.userName}</p>
                                    <span className="text-xs text-muted-foreground">
                                        {review.createdAt.toDate().toLocaleDateString()}
                                    </span>
                                </div>
                                <StarRating rating={review.rating} readonly size={16}/>
                                <p className="mt-2 text-muted-foreground">{review.reviewText}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    </div>
  );
}
