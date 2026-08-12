'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/state-components';

export function FarmersClient() {
  const query = useQuery({
    queryKey: ['admin', 'farmers'],
    queryFn: () => adminService.getFarmers(1, 50),
  });

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'district', header: 'District' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Farmers</h1>
      <Card className="p-4">
        {query.isError ? (
          <ErrorMessage message="Farmers could not be loaded." onRetry={() => query.refetch()} />
        ) : (
          <AdminTable columns={columns} data={query.data?.items || []} isLoading={query.isLoading} emptyMessage="No farmers found" />
        )}
      </Card>
    </div>
  );
}
