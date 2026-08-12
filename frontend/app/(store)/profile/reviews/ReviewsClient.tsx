'use client';

import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/services';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState, Unauthorized, ErrorMessage } from '@/components/common/state-components';
import { formatDate } from '@/lib/utils';
import { Star } from 'lucide-react';

export function ReviewsClient() {
  const { isAuthenticated, isRestoring } = useAuth();

  const reviewsQuery = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => customerService.getMyReviews(),
    enabled: isAuthenticated,
  });

  if (isRestoring) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Unauthorized />;

  if (reviewsQuery.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (reviewsQuery.isError) {
    return (
      <ErrorMessage
        message="Reviews could not be loaded."
        onRetry={() => reviewsQuery.refetch()}
      />
    );
  }

  const reviews = reviewsQuery.data || [];

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description="When you review a product, it will appear here"
        icon={<Star className="h-6 w-6" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(review.created_at)}
            </span>
          </div>
          {review.title && (
            <h3 className="mt-3 font-semibold">{review.title}</h3>
          )}
          {review.comment && (
            <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
          )}
          {review.product && (
            <p className="mt-3 text-sm text-primary">
              {review.product.name}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}