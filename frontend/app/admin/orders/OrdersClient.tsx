'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorMessage } from '@/components/common/state-components';
import { formatBDT, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils';
import { useRolePath } from '@/lib/role-utils';
import { Eye } from 'lucide-react';
import { Order } from '@/types';

export function OrdersClient() {
  const { to } = useRolePath();
  const ordersQuery = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => adminService.getOrders(1, 50),
  });

  const columns = [
    { key: 'order_number', header: 'Order #' },
    {
      key: 'created_at',
      header: 'Date',
      render: (o: Order) => formatDate(o.created_at),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o: Order) => (
        <Badge className={ORDER_STATUS_COLORS[o.status]}>
          {ORDER_STATUS_LABELS[o.status]}
        </Badge>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (o: Order) => formatBDT(o.total),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (o: Order) => (
                  <Link href={to(`/orders/${o.id}`)}>
          <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>
      <Card className="p-4">
        {ordersQuery.isError ? (
          <ErrorMessage message="Orders could not be loaded." onRetry={() => ordersQuery.refetch()} />
        ) : (
          <AdminTable
            columns={columns}
            data={ordersQuery.data?.items || []}
            isLoading={ordersQuery.isLoading}
            emptyMessage="No orders found"
          />
        )}
      </Card>
    </div>
  );
}
