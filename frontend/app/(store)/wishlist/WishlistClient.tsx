'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services';
import { useAuth } from '@/hooks/use-auth';
import { useCartStore, useUIStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState, Unauthorized, ErrorMessage } from '@/components/common/state-components';
import { formatBDT, getImageUrl } from '@/lib/utils';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function WishlistClient() {
  const { isAuthenticated, isRestoring } = useAuth();
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);
  const showToast = useUIStore((state) => state.showToast);

  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => customerService.getWishlist(),
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: (productId: number) => customerService.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      showToast('Removed from wishlist');
    },
    onError: (error: Error) => showToast(error.message, 'error'),
  });

  if (isRestoring) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Unauthorized />;

  if (wishlistQuery.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (wishlistQuery.isError) {
    return (
      <ErrorMessage
        message="Wishlist could not be loaded."
        onRetry={() => wishlistQuery.refetch()}
      />
    );
  }

  const items = wishlistQuery.data || [];

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save products you love to find them later"
        icon={<Heart className="h-6 w-6" />}
        action={
          <Link href="/products">
            <Button>Shop Fresh</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const product = item.product;
        if (!product) return null;
        const price = product.discount_price || product.price;

        return (
          <Card key={item.id} className="overflow-hidden">
            <Link
              href={`/products/${product.slug}`}
              className="relative block aspect-square bg-muted"
            >
              {product.images?.[0]?.url ? (
                <Image
                  src={getImageUrl(product.images[0].url)}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  No image
                </div>
              )}
            </Link>
            <div className="p-4">
              <Link
                href={`/products/${product.slug}`}
                className="line-clamp-1 font-medium hover:text-primary"
              >
                {product.name}
              </Link>
              <p className="mt-1 text-lg font-bold">{formatBDT(price)}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    addItem(product, 1);
                    showToast(`${product.name} added to cart`);
                  }}
                >
                  <ShoppingCart className="mr-1 h-3 w-3" />
                  Add to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeMutation.mutate(product.id)}
                  aria-label={`Remove ${product.name} from wishlist`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}