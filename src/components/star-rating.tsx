
"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  className?: string;
  readonly?: boolean;
}

export function StarRating({
  rating,
  onRatingChange,
  size = 20,
  className,
  readonly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (index: number) => {
    if (onRatingChange && !readonly) {
      onRatingChange(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (!readonly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className={cn("flex items-center", className)} onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          size={size}
          className={cn(
            "cursor-pointer",
            (hoverRating || rating) >= index ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
            readonly && "cursor-default"
          )}
          onClick={() => handleStarClick(index)}
          onMouseEnter={() => handleMouseEnter(index)}
        />
      ))}
    </div>
  );
}
