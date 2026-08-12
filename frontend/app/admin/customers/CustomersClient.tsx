'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/state-components';

export function CustomersClient() {
  const query = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: () => adminService.getCustomers(1, 50),
  });

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Customers</h1>
      <Card className="p-4">
        {query.isError ? (
          <ErrorMessage message="Customers could not be loaded." onRetry={() => query.refetch()} />
        ) : (
          <AdminTable columns={columns} data={query.data?.items || []} isLoading={query.isLoading} emptyMessage="No customers found" />
        )}
      </Card>
    </div>
  );
}
