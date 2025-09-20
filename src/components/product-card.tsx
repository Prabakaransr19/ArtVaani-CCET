
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { useTranslation } from "@/hooks/useTranslation";
import type { Product } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useTranslation();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: `Product added to cart!`,
      description: "You can view your cart by clicking the bag icon.",
    });
  };
  
  const price = product.aiPrice || product.price || 0;
  const title = product.aiTitle || product.title || 'Untitled Product';
  const description = product.aiStory || product.description || '';

  return (
    <Card className="rounded-2xl soft-shadow overflow-hidden group">
      <CardContent className="p-0">
        <div className="relative">
          <Link href={`/products/${product.id}`}>
            <Image
              src={product.imageUrl}
              alt={title}
              width={600}
              height={600}
              className="object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.imageHint}
            />
          </Link>
        </div>
        <div className="p-4 space-y-2">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-lg truncate hover:text-primary">{title}</h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          <div className="flex justify-between items-center pt-2">
            <p className="text-primary font-bold text-xl">₹{price.toFixed(2)}</p>
            <Button onClick={handleAddToCart} className="rounded-2xl soft-shadow">
              <ShoppingCart className="mr-2 h-4 w-4"/>
              {t('add_to_cart')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
