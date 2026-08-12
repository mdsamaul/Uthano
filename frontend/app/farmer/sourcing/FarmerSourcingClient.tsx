'use client';

import { useQuery } from '@tanstack/react-query';
import { farmerService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/state-components';
import { formatBDT } from '@/lib/utils';
import { SourcingRecord } from '@/types';

export function FarmerSourcingClient() {
  const query = useQuery({
    queryKey: ['farmer', 'sourcing'],
    queryFn: () => farmerService.getMySourcing(1, 50),
  });

  const columns = [
    { key: 'batch_code', header: 'Batch' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unit', header: 'Unit' },
    {
      key: 'total_value',
      header: 'Total Value',
      render: (s: SourcingRecord) => formatBDT(s.total_value),
    },
    { key: 'status', header: 'Status' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Supply Records</h1>
      <Card className="p-4">
        {query.isError ? (
          <ErrorMessage message="Supply records could not be loaded." onRetry={() => query.refetch()} />
        ) : (
          <AdminTable columns={columns} data={query.data?.items || []} isLoading={query.isLoading} emptyMessage="No supply records found" />
        )}
      </Card>
    </div>
  );
}
