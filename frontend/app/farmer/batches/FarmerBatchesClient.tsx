'use client';

import { useQuery } from '@tanstack/react-query';
import { farmerService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/state-components';

export function FarmerBatchesClient() {
  const query = useQuery({
    queryKey: ['farmer', 'batches'],
    queryFn: () => farmerService.getMyBatches(1, 50),
  });

  const columns = [
    { key: 'batch_code', header: 'Batch Code' },
    { key: 'harvest_name', header: 'Harvest' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Batches</h1>
      <Card className="p-4">
        {query.isError ? (
          <ErrorMessage message="Batches could not be loaded." onRetry={() => query.refetch()} />
        ) : (
          <AdminTable columns={columns} data={query.data?.items || []} isLoading={query.isLoading} emptyMessage="No batches found" />
        )}
      </Card>
    </div>
  );
}
