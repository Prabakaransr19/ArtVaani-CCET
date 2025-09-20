
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit } from "lucide-react";
import { getMyProducts } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default function MyProductsPage() {
  const { user } = useAuth();
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getMyProducts(user.uid).then(products => {
        setMyProducts(products);
        setLoading(false);
      });
    } else {
        setLoading(false);
    }
  }, [user]);


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Link href="/dashboard/products/new">
          <Button className="rounded-2xl soft-shadow">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <p>Loading your products...</p>
      ) : myProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProducts.map(product => (
            <Card key={product.id} className="rounded-2xl soft-shadow overflow-hidden">
              <CardContent className="p-4">
                <div className="relative">
                    <Image 
                      src={product.imageUrl} 
                      alt={product.aiTitle || 'Product image'} 
                      width={400} 
                      height={400} 
                      className="rounded-lg aspect-square object-cover mb-4"
                      data-ai-hint={product.imageHint}
                    />
                    <Badge 
                        className="absolute top-2 right-2"
                        variant={product.status === 'published' ? 'default' : 'secondary'}
                    >
                        {product.status}
                    </Badge>
                </div>

                <h3 className="font-semibold truncate">{product.aiTitle || 'Untitled Product'}</h3>
                <p className="text-primary font-bold">₹{product.aiPrice?.toFixed(2) || '0.00'}</p>
                
                <Link href={`/dashboard/products/edit/${product.id}`} className="mt-4">
                    <Button variant="outline" size="sm" className="w-full rounded-lg">
                        <Edit className="mr-2 h-4 w-4"/>
                        {product.status === 'draft' ? 'Review & Publish' : 'Edit'}
                    </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">You haven't added any products yet.</p>
      )}
    </div>
  );
}
