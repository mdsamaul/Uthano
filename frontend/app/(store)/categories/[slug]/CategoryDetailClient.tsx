'use client';

import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services';
import { Category } from '@/types';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ErrorMessage } from '@/components/common/state-components';

interface CategoryDetailClientProps {
  category: Category;
}

export function CategoryDetailClient({ category }: CategoryDetailClientProps) {
  const productsQuery = useQuery({
    queryKey: ['products', 'category', category.slug],
    queryFn: () =>
      productService.getProducts({
        category: category.slug,
        per_page: 24,
      }),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}
        {category.product_count !== undefined && (
          <p className="mt-2 text-sm text-muted-foreground">
            {category.product_count} products
          </p>
        )}
      </div>

      {productsQuery.isError ? (
        <ErrorMessage
          message="Products could not be loaded."
          onRetry={() => productsQuery.refetch()}
        />
      ) : (
        <ProductGrid
          products={productsQuery.data?.items || []}
          isLoading={productsQuery.isLoading}
        />
      )}
    </div>
  );
}