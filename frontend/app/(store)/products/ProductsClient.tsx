'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productService, categoryService } from '@/services';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/common/pagination';
import { ErrorMessage } from '@/components/common/state-components';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
];

export function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [seasonal, setSeasonal] = useState(searchParams.get('seasonal') === 'true');
  const [featured, setFeatured] = useState(searchParams.get('featured') === 'true');
  const [showFilters, setShowFilters] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: ['products', { page, search, category, sort, minPrice, maxPrice, seasonal, featured }],
    queryFn: () =>
      productService.getProducts({
        page,
        per_page: 20,
        search: search || undefined,
        category: category || undefined,
        sort: sort as never,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        seasonal: seasonal || undefined,
        featured: featured || undefined,
      }),
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort && sort !== 'newest') params.set('sort', sort);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (seasonal) params.set('seasonal', 'true');
    if (featured) params.set('featured', 'true');
    if (page > 1) params.set('page', String(page));

    const query = params.toString();
    router.replace(query ? `/products?${query}` : '/products', { scroll: false });
  }, [search, category, sort, minPrice, maxPrice, seasonal, featured, page, router]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  }, []);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('newest');
    setMinPrice('');
    setMaxPrice('');
    setSeasonal(false);
    setFeatured(false);
    setPage(1);
  };

  const hasActiveFilters =
    search || category || minPrice || maxPrice || seasonal || featured;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Shop Fresh Products</h1>
        <p className="mt-2 text-muted-foreground">
          Fresh from the farm, delivered to your home
        </p>
      </div>

      {/* Search & Sort */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Search products"
          />
        </form>
        <div className="flex items-center gap-2">
          <Select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            aria-label="Sort products"
            className="w-48"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
            className={showFilters ? 'bg-muted' : ''}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Categories</option>
                {categoriesQuery.data?.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Min Price (৳)</label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max Price (৳)</label>
              <Input
                type="number"
                min="0"
                placeholder="1000"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex items-end gap-4 pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={seasonal}
                  onChange={(e) => {
                    setSeasonal(e.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                Seasonal
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => {
                    setFeatured(e.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                Featured
              </label>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {productsQuery.data?.meta.total || 0} products found
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-3 w-3" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Products */}
      {productsQuery.isError ? (
        <ErrorMessage
          message="Products could not be loaded."
          onRetry={() => productsQuery.refetch()}
        />
      ) : (
        <>
          <ProductGrid
            products={productsQuery.data?.items || []}
            isLoading={productsQuery.isLoading}
          />
          {productsQuery.data && (
            <div className="mt-8">
              <Pagination
                meta={productsQuery.data.meta}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}