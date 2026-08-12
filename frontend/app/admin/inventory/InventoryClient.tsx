'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorMessage } from '@/components/common/state-components';
import { Inventory } from '@/types';

export function InventoryClient() {
  const query = useQuery({
    queryKey: ['admin', 'inventory'],
    queryFn: () => adminService.getInventory(1, 50),
  });

  const columns = [
    { key: 'product_name', header: 'Product' },
    { key: 'batch_code', header: 'Batch' },
    { key: 'warehouse_name', header: 'Warehouse' },
    {
      key: 'available',
      header: 'Available',
      render: (i: Inventory) => `${i.available_qty} ${i.product?.unit || ''}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (i: Inventory) => (
        <Badge variant={i.available_qty < 10 ? 'warning' : 'success'}>
          {i.available_qty < 10 ? 'Low Stock' : 'In Stock'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inventory</h1>
      <Card className="p-4">
        {query.isError ? (
          <ErrorMessage message="Inventory could not be loaded." onRetry={() => query.refetch()} />
        ) : (
          <AdminTable columns={columns} data={query.data?.items || []} isLoading={query.isLoading} emptyMessage="No inventory found" />
        )}
      </Card>
    </div>
  );
}
