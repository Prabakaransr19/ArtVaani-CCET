
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListFilter, X, Search } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";

export type SortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc';

interface ProductFiltersProps {
  tags: string[];
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  selectedTags: string[];
  onTagChange: (tags: string[]) => void;
  priceRange: { min: number; max: number };
  onPriceChange: (range: { min: number; max: number }) => void;
  onReset: () => void;
}

export function ProductFilters({
  tags,
  sortOption,
  onSortChange,
  selectedTags,
  onTagChange,
  priceRange,
  onPriceChange,
  onReset,
}: ProductFiltersProps) {

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    onPriceChange({ ...priceRange, min: value });
  };
  
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? Infinity : Number(e.target.value);
    onPriceChange({ ...priceRange, max: value });
  };
  
  return (
    <div className="p-4 bg-card rounded-2xl soft-shadow mb-8 sticky top-20 z-30">
      <div className="flex flex-wrap items-center gap-4">
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-lg">
              <ListFilter className="mr-2 h-4 w-4" />
              Sort By
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Sort Products</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
              <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="price-asc">Price: Low to High</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="price-desc">Price: High to Low</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tag Multi-select Popover */}
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-lg">
                    <Search className="mr-2 h-4 w-4"/>
                    Tags ({selectedTags.length})
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <MultiSelect
                    options={tags.map(tag => ({ value: tag, label: tag }))}
                    selected={selectedTags}
                    onChange={onTagChange}
                    className="w-full"
                />
            </PopoverContent>
        </Popover>

        {/* Price Range Inputs */}
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Price:</span>
             <Input
                type="number"
                placeholder="Min"
                className="w-24 rounded-lg"
                value={priceRange.min === 0 ? '' : priceRange.min}
                onChange={handleMinPriceChange}
              />
            <span>-</span>
             <Input
                type="number"
                placeholder="Max"
                className="w-24 rounded-lg"
                value={priceRange.max === Infinity ? '' : priceRange.max}
                onChange={handleMaxPriceChange}
              />
        </div>

        {/* Reset Button */}
        <Button variant="ghost" onClick={onReset} className="rounded-lg ml-auto">
          <X className="mr-2 h-4 w-4"/>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
