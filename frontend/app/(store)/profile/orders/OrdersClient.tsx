'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState, Unauthorized, ErrorMessage } from '@/components/common/state-components';
import { formatBDT, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils';
import { Package } from 'lucide-react';

export function OrdersClient() {
  const { isAuthenticated, isRestoring } = useAuth();

  const ordersQuery = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getOrders(1, 20),
    enabled: isAuthenticated,
  });

  if (isRestoring) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Unauthorized />;
  }

  if (ordersQuery.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (ordersQuery.isError) {
    return (
      <ErrorMessage
        message="Orders could not be loaded."
        onRetry={() => ordersQuery.refetch()}
      />
    );
  }

  const orders = ordersQuery.data?.items || [];

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you place an order, it will appear here"
        icon={<Package className="h-6 w-6" />}
        action={
          <Link href="/products">
            <Button>Shop Fresh</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link
                href={`/orders/${order.order_number}`}
                className="text-lg font-semibold text-primary hover:underline"
              >
                {order.order_number}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(order.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={ORDER_STATUS_COLORS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <span className="text-lg font-bold">{formatBDT(order.total)}</span>
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''} •{' '}
              {order.items.map((item) => item.product?.name).join(', ')}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}