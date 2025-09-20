
"use client";

import { useEffect, useState, useMemo } from 'react';
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductFilters, SortOption } from '@/components/product-filters';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Filter states
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: Infinity });

  useEffect(() => {
    getProducts().then(products => {
      setProducts(products);
      setFilteredProducts(products); // Initially, show all products
      setLoading(false);
    });
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach(p => p.aiTags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [products]);

  useEffect(() => {
    let tempProducts = [...products];

    // Filter by tags
    if (selectedTags.length > 0) {
      tempProducts = tempProducts.filter(p =>
        selectedTags.every(tag => p.aiTags?.includes(tag))
      );
    }

    // Filter by price
    tempProducts = tempProducts.filter(p => {
        const price = p.aiPrice || 0;
        const min = priceRange.min || 0;
        const max = priceRange.max || Infinity;
        return price >= min && price <= max;
    });

    // Sort
    tempProducts.sort((a, b) => {
      const priceA = a.aiPrice || 0;
      const priceB = b.aiPrice || 0;
      const dateA = a.createdAt?.toMillis() || 0;
      const dateB = b.createdAt?.toMillis() || 0;

      switch (sortOption) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - a.aiPrice;
        case 'oldest':
          return dateA - dateB;
        case 'newest':
        default:
          return dateB - dateA;
      }
    });

    setFilteredProducts(tempProducts);
  }, [sortOption, selectedTags, priceRange, products]);
  
  const handleResetFilters = () => {
    setSortOption('newest');
    setSelectedTags([]);
    setPriceRange({ min: 0, max: Infinity });
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-headline">Our Collection</h1>
        <p className="text-muted-foreground mt-2">Explore handcrafted treasures from talented artisans.</p>
      </div>
      
      <ProductFilters
        tags={allTags}
        sortOption={sortOption}
        onSortChange={setSortOption}
        selectedTags={selectedTags}
        onTagChange={setSelectedTags}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        onReset={handleResetFilters}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[300px] w-full rounded-2xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mt-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground mt-16">
            <p>No products match your filters.</p>
            <Button variant="link" onClick={handleResetFilters}>Clear filters</Button>
        </div>
      )}
    </div>
  );
}
