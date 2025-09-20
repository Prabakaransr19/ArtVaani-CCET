

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
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

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

const FilterContent = ({
  tags,
  sortOption,
  onSortChange,
  selectedTags,
  onTagChange,
  priceRange,
  onPriceChange,
}: Omit<ProductFiltersProps, 'onReset'>) => {

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    onPriceChange({ ...priceRange, min: value });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? Infinity : Number(e.target.value);
    onPriceChange({ ...priceRange, max: value });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-lg w-full justify-between">
            <span>
              Sort By: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1).replace('-', ' ')}
            </span>
            <ListFilter className="h-4 w-4" />
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

      {/* Tag Multi-select */}
      <div>
        <label className="text-sm font-medium">Tags</label>
        <MultiSelect
          options={tags.map(tag => ({ value: tag, label: tag }))}
          selected={selectedTags}
          onChange={onTagChange}
          className="w-full mt-2"
          placeholder="Filter by tags"
        />
      </div>

      {/* Price Range Inputs */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Price Range</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="w-full rounded-lg"
            value={priceRange.min === 0 ? '' : priceRange.min}
            onChange={handleMinPriceChange}
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="Max"
            className="w-full rounded-lg"
            value={priceRange.max === Infinity ? '' : priceRange.max}
            onChange={handleMaxPriceChange}
          />
        </div>
      </div>
    </div>
  );
};


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

  const isMobile = useIsMobile();

  if (isMobile === undefined) {
    return null; // Don't render until we know the device type
  }

  if (isMobile) {
    return (
      <div className="mb-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full rounded-lg">
              <ListFilter className="mr-2 h-4 w-4" />
              Filters & Sort
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FilterContent {...{ tags, sortOption, onSortChange, selectedTags, onTagChange, priceRange, onPriceChange }} />
             <div className="p-4">
                <Button variant="ghost" onClick={onReset} className="rounded-lg w-full">
                  <X className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
             </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

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
              <Search className="mr-2 h-4 w-4" />
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
            onChange={(e) => onPriceChange({ ...priceRange, min: Number(e.target.value) })}
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="Max"
            className="w-24 rounded-lg"
            value={priceRange.max === Infinity ? '' : priceRange.max}
            onChange={(e) => onPriceChange({ ...priceRange, max: e.target.value ? Number(e.target.value) : Infinity })}
          />
        </div>

        {/* Reset Button */}
        <Button variant="ghost" onClick={onReset} className="rounded-lg ml-auto">
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
