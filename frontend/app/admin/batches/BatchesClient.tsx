'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/common/state-components';
import { useAccess } from '@/hooks/use-access';

export function BatchesClient() {
  const router = useRouter();
  const { hasPermission } = useAccess();
  const canManage = hasPermission('batch.manage');

  // Get current role from URL (superadmin, admin, etc.)
  const currentRole = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'admin' : 'admin';

  const query = useQuery({
    queryKey: ['admin', 'batches'],
    queryFn: () => adminService.getBatches(1, 50),
  });

  const columns = [
    { key: 'batch_code', header: 'Batch Code' },
    { key: 'harvest_name', header: 'Harvest' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Batches</h1>
        {canManage && (
          <Button onClick={() => router.push(`/${currentRole}/batches/create`)}>
            Create Batch
          </Button>
        )}
      </div>
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

