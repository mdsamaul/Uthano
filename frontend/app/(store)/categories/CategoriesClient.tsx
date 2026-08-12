'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services';
import { ErrorMessage } from '@/components/common/state-components';
import { Leaf } from 'lucide-react';

export function CategoriesClient() {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shop by Category</h1>
        <p className="mt-2 text-muted-foreground">
          Browse fresh products by category
        </p>
      </div>

      {categoriesQuery.isError ? (
        <ErrorMessage
          message="Categories could not be loaded."
          onRetry={() => categoriesQuery.refetch()}
        />
      ) : categoriesQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categoriesQuery.data?.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center transition-shadow hover:shadow-card-hover"
            >
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium group-hover:text-primary">
                {category.name}
              </p>
              {category.product_count !== undefined && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.product_count} products
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}