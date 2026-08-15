'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { useAccess } from '@/hooks/use-access';
import { formatBDT, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_METHOD_LABELS } from '@/lib/utils';
import { useRolePath } from '@/lib/role-utils';
import { ArrowLeft, Package } from 'lucide-react';
import { AdminOrder, AdminOrderItem } from '@/types';

const ORDER_STATUS_OPTIONS = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'READY_FOR_DELIVERY',
  'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED',
] as const;

function statusLabel(status?: string): string {
  if (!status) return '—';
  return ORDER_STATUS_LABELS[status.toLowerCase()] ?? status;
}

function statusColor(status?: string): string {
  if (!status) return 'bg-muted text-muted-foreground';
  return ORDER_STATUS_COLORS[status.toLowerCase()] ?? 'bg-muted text-muted-foreground';
}

export function OrderDetailClient({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasPermission } = useAccess();
  const { to } = useRolePath();
  const canUpdate = hasPermission('order.update');
  const [statusDraft, setStatusDraft] = useState('');

  const orderQuery = useQuery({
    queryKey: ['admin', 'orders', orderId],
    queryFn: () => adminService.getOrder(Number(orderId)),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminService.updateOrderStatus(Number(orderId), status as never),
    onSuccess: (updated) => {
      showToast('Order status updated successfully.');
      setStatusDraft('');
      queryClient.setQueryData(['admin', 'orders', orderId], updated);
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to update order status.', 'error'),
  });

  const back = (
    <Link href={to('/orders')} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
      <ArrowLeft className="h-4 w-4" /> Back to Orders
    </Link>
  );

  if (orderQuery.isError) {
    return (
      <div className="space-y-4">
        {back}
        <ErrorMessage message="Order could not be loaded." onRetry={() => orderQuery.refetch()} />
      </div>
    );
  }

  if (orderQuery.isLoading) {
    return (
      <div className="space-y-4">
        {back}
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

    const order = orderQuery.data as unknown as AdminOrder | null;
  if (!order) {
    return (
      <div className="space-y-4">
        {back}
        <Card className="p-6 text-center text-sm text-muted-foreground">Order not found.</Card>
      </div>
    );
  }

  const currentStatus = statusDraft || order.order_status;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
          <Link href={to('/orders')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
          <Badge className={statusColor(order.order_status)}>{statusLabel(order.order_status)}</Badge>
        </div>
                <Link href={to('/orders')}>
          <Button variant="outline" size="sm">All Orders</Button>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Order items */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Qty</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items ?? []).map((item: AdminOrderItem) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">{item.sku}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{formatBDT(item.unit_price)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatBDT(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
<div className="space-y-1 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatBDT(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-danger">-{formatBDT(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Charge</span>
                <span>{formatBDT(order.delivery_charge)}</span>
              </div>
              {order.tax != null && order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatBDT(order.tax)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 text-base font-bold">
                <span>Total</span>
                <span>{formatBDT(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar: status, customer & delivery, history */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Current:</span>
                <Badge className={statusColor(currentStatus)}>{statusLabel(currentStatus)}</Badge>
              </div>
              {canUpdate ? (
                <div className="flex gap-2">
                  <Select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)}>
                    <option value="">Change status…</option>
                    {ORDER_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{statusLabel(s)}</option>
                    ))}
                  </Select>
                  <Button
                    onClick={() => statusDraft && statusMutation.mutate(statusDraft)}
                    disabled={!statusDraft || statusMutation.isPending}
                    isLoading={statusMutation.isPending}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">You need the order.update permission to change status.</p>
              )}
              {order.notes && (
                <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">Note: {order.notes}</p>
              )}
            </CardContent>
          </Card>
<Card>
            <CardHeader><CardTitle>Customer & Delivery</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.address ? (
                <>
                  <p className="font-medium">{order.address.name || 'Customer'}</p>
                  {order.address.phone && <p className="text-muted-foreground">{order.address.phone}</p>}
                  <p className="text-muted-foreground">
                    {[order.address.address_line, order.address.upazila, order.address.district]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">No shipping address recorded.</p>
              )}
              <div className="border-t border-border pt-2">
                <p className="text-muted-foreground">
                  Payment: <span className="font-medium text-foreground">{PAYMENT_METHOD_LABELS[order.payment_method ?? ''] ?? order.payment_method ?? '—'}</span>
                </p>
                <p className="text-muted-foreground">
                  Payment Status: <span className="font-medium text-foreground">{order.payment_status ?? '—'}</span>
                </p>
              </div>
              {order.delivery && (
                <div className="border-t border-border pt-2">
                  <p className="text-muted-foreground">Delivery: {order.delivery.delivery_code || '—'}</p>
                  <p className="text-muted-foreground">Delivery Status: {order.delivery.status || '—'}</p>
                </div>
              )}
              <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                {order.placed_at && <p>Placed: {formatDateTime(order.placed_at)}</p>}
                {order.delivered_at && <p>Delivered: {formatDateTime(order.delivered_at)}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Status History</CardTitle></CardHeader>
            <CardContent>
              {order.status_histories && order.status_histories.length > 0 ? (
                <ol className="space-y-3">
                  {order.status_histories.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${statusColor(h.status)}`} />
                      <div>
                        <p className="font-medium">{statusLabel(h.status)}</p>
                        {h.notes && <p className="text-xs text-muted-foreground">{h.notes}</p>}
                        {h.changed_at && <p className="text-xs text-muted-foreground">{formatDateTime(h.changed_at)}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">No status history recorded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}