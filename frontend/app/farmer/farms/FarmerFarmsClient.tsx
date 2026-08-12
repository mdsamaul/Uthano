'use client';

import { useQuery } from '@tanstack/react-query';
import { farmerService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/state-components';

export function FarmerFarmsClient() {
  const query = useQuery({
    queryKey: ['farmer', 'farms'],
    queryFn: () => farmerService.getMyFarms(),
  });

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'district', header: 'District' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Farms</h1>
      <Card className="p-4">
        {query.isError ? (
          <ErrorMessage message="Farms could not be loaded." onRetry={() => query.refetch()} />
        ) : (
          <AdminTable columns={columns} data={query.data || []} isLoading={query.isLoading} emptyMessage="No farms found" />
        )}
      </Card>
    </div>
  );
}
