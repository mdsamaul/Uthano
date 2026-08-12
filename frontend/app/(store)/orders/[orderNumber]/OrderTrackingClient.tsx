'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services';
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorMessage, NotFound } from '@/components/common/state-components';
import { Spinner } from '@/components/ui/spinner';
import { formatBDT, formatDate, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/utils';

export function OrderTrackingClient() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params?.orderNumber || '';

  const orderQuery = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => orderService.getOrder(orderNumber),
    enabled: !!orderNumber,
  });

  if (orderQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (orderQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorMessage
          message="Order could not be loaded."
          onRetry={() => orderQuery.refetch()}
        />
      </div>
    );
  }

  const order = orderQuery.data;

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <NotFound title="Order Not Found" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Order {order.order_number}</h1>
        <p className="mt-2 text-muted-foreground">
          Placed on {formatDate(order.created_at)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="success">{ORDER_STATUS_LABELS[order.status]}</Badge>
          <span className="text-sm text-muted-foreground">
            {PAYMENT_METHOD_LABELS[order.payment_method]}
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-6 text-lg font-semibold">Order Tracking</h2>
            <OrderStatusTimeline currentStatus={order.status} />
          </Card>

          {/* Items */}
          <Card className="mt-6 p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Items</h2>
            <ul className="space-y-4">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <Link
                      href={`/products/${item.product?.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {item.product?.name || `Product #${item.product_id}`}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.quantity} × {formatBDT(item.unit_price)}
                    </p>
                  </div>
                  <span className="font-medium">{formatBDT(item.subtotal)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatBDT(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Delivery Fee</dt>
                <dd>{formatBDT(order.delivery_fee)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className="text-success">-{formatBDT(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="text-lg font-bold">{formatBDT(order.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="mt-6 p-6">
            <h2 className="text-lg font-semibold">Delivery Address</h2>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {order.delivery_address.name}
              </p>
              <p>{order.delivery_address.phone}</p>
              <p>
                {order.delivery_address.address}, {order.delivery_address.area},
                {order.delivery_address.upazila}, {order.delivery_address.district},
                {order.delivery_address.division}
              </p>
            </div>
          </Card>

          <Link href="/profile/orders" className="mt-6 block">
            <Button variant="outline" className="w-full">
              View All Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}