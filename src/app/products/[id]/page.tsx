
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getProductById } from '@/lib/products';
import { Product, Review } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, ShoppingCart, UserCheck } from 'lucide-react';
import { doc, getDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { ReviewForm } from '@/components/review-form';
import { ProductReviews } from '@/components/product-reviews';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [artisan, setArtisan] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchProductAndArtisan = async () => {
        setLoading(true);
        const fetchedProduct = await getProductById(id);
        
        if (fetchedProduct && fetchedProduct.artisanId) {
            const userDocRef = doc(db, 'users', fetchedProduct.artisanId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setArtisan(userDoc.data() as UserProfile);
            }
        }
        setProduct(fetchedProduct);
        setLoading(false);
      };
      fetchProductAndArtisan();

      const q = query(collection(db, 'products', id, 'reviews'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedReviews = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as Review);
        setReviews(fetchedReviews);
        if (user && fetchedReviews.some(r => r.userId === user.uid)) {
            setHasReviewed(true);
        }
      });

      return () => unsubscribe();
    }
  }, [id, user]);

  useEffect(() => {
      if (profile && product) {
          setHasPurchased(profile.purchasedProductIds?.includes(product.id) || false);
      }
  }, [profile, product]);


  if (loading) {
    return (
      <div className="container py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return <div className="container py-12 text-center">Product not found.</div>;
  }
  
  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: `Product added to cart!`,
    });
  };

  const handleReviewSubmitted = () => {
    setHasReviewed(true);
  }

  const tags = Array.isArray(product.aiTags) ? product.aiTags : [];
  const price = product.aiPrice || product.price || 0;
  const title = product.aiTitle || product.title || 'Untitled Product';
  const description = product.aiStory || product.description || '';


  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Image
            src={product.imageUrl}
            alt={title}
            width={800}
            height={800}
            className="rounded-2xl object-cover w-full aspect-square soft-shadow"
            data-ai-hint={product.imageHint}
          />
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-headline">{title}</h1>
          
          {artisan && (
            <div className="flex items-center gap-2">
                <p className="text-lg text-muted-foreground">by <span className="font-semibold text-primary">{artisan.name}</span> from {artisan.city}</p>
                {artisan.verified && <UserCheck className="h-5 w-5 text-green-500" title="Verified Artisan"/>}
            </div>
          )}

          <p className="text-3xl font-bold text-primary">₹{price.toFixed(2)}</p>
          
          <div className="flex flex-wrap gap-2">
            {tags.filter(h => h).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-lg">{tag}</Badge>
            ))}
          </div>

          <Button onClick={handleAddToCart} size="lg" className="w-full md:w-auto rounded-2xl soft-shadow">
            <ShoppingCart className="mr-2"/>
            Add to Cart
          </Button>

          <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">Description</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                {description}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      
      <ProductReviews 
        productId={product.id}
        initialStats={{averageRating: product.averageRating || 0, reviewCount: product.reviewCount || 0}}
      />
      
      {hasPurchased && !hasReviewed && (
          <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
      )}
    </div>
  );
}
