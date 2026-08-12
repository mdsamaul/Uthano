'use client';

import { useQuery } from '@tanstack/react-query';
import { deliveryService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorMessage } from '@/components/common/state-components';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils';
import { Delivery } from '@/types';

export function CompletedDeliveriesClient() {
  const query = useQuery({
    queryKey: ['delivery', 'completed'],
    queryFn: () => deliveryService.getCompletedDeliveries(1, 50),
  });

  const columns = [
    { key: 'order_number', header: 'Order #' },
    { key: 'customer_name', header: 'Customer' },
    {
      key: 'status',
      header: 'Status',
      render: (d: Delivery) => (
        <Badge className={ORDER_STATUS_COLORS[d.status]}>
          {ORDER_STATUS_LABELS[d.status]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Completed Deliveries</h1>
      <Card className="p-4">
        {query.isError ? (
          <ErrorMessage message="Completed deliveries could not be loaded." onRetry={() => query.refetch()} />
        ) : (
          <AdminTable columns={columns} data={query.data?.items || []} isLoading={query.isLoading} emptyMessage="No completed deliveries found" />
        )}
      </Card>
    </div>
  );
}
