
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSimilarProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface SimilarProductsProps {
  tags: string[];
  currentProductId: string;
}

export function SimilarProducts({ tags, currentProductId }: SimilarProductsProps) {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const products = await getSimilarProducts(tags, currentProductId);
      setSimilarProducts(products);
      setLoading(false);
    };

    fetchProducts();
  }, [tags, currentProductId]);

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-3xl font-headline mb-8">Similar Products You May Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/4" />
                </div>
            ))}
        </div>
      </div>
    );
  }
  
  if (similarProducts.length === 0) {
    return (
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-headline mb-4">Similar Products You May Like</h2>
        <p className="text-muted-foreground">No similar products found. Check out our full collection instead.</p>
        <Link href="/products" className="mt-4 inline-block">
          <Button>View All Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-headline mb-8">Similar Products You May Like</h2>
       <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {similarProducts.map((product) => (
            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                 <ProductCard product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex"/>
        <CarouselNext className="hidden md:flex"/>
      </Carousel>
    </div>
  );
}
