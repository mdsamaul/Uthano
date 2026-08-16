'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorMessage } from '@/components/common/state-components';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils';
import { Delivery } from '@/types';

export function DeliveriesClient() {
  const query = useQuery({
    queryKey: ['admin', 'deliveries'],
    queryFn: () => adminService.getDeliveries(1, 50),
  });

  const columns = [
    { key: 'order_number', header: 'Order #' },
    { key: 'customer_name', header: 'Customer' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'status',
      header: 'Status',
      render: (d: Delivery) => {
        const statusKey = (d.status || '').toLowerCase();
        return (
          <Badge className={ORDER_STATUS_COLORS[statusKey] ?? 'bg-muted text-muted-foreground'}>
            {ORDER_STATUS_LABELS[statusKey] ?? d.status}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Deliveries</h1>
      <Card className="p-4">
        {query.isError ? (
          <ErrorMessage message="Deliveries could not be loaded." onRetry={() => query.refetch()} />
        ) : (
          <AdminTable columns={columns} data={query.data?.items || []} isLoading={query.isLoading} emptyMessage="No deliveries found" />
        )}
      </Card>
    </div>
  );
}
