'use client';

import { useQuery } from '@tanstack/react-query';
import { farmerService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/state-components';

export function FarmerHarvestsClient() {
  const query = useQuery({
    queryKey: ['farmer', 'harvests'],
    queryFn: () => farmerService.getMyHarvests(1, 50),
  });

  const columns = [
    { key: 'farm_name', header: 'Farm' },
    { key: 'crop_name', header: 'Crop' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unit', header: 'Unit' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Harvests</h1>
      <Card className="p-4">
        {query.isError ? (
          <ErrorMessage message="Harvests could not be loaded." onRetry={() => query.refetch()} />
        ) : (
          <AdminTable columns={columns} data={query.data?.items || []} isLoading={query.isLoading} emptyMessage="No harvests found" />
        )}
      </Card>
    </div>
  );
}
