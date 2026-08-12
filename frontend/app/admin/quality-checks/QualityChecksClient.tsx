'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorMessage } from '@/components/common/state-components';
import { QualityCheck } from '@/types';

export function QualityChecksClient() {
  const query = useQuery({
    queryKey: ['admin', 'quality-checks'],
    queryFn: () => adminService.getQualityChecks(1, 50),
  });

  const columns = [
    { key: 'batch_code', header: 'Batch' },
    { key: 'checked_by', header: 'Checked By' },
    { key: 'checked_at', header: 'Date' },
    {
      key: 'status',
      header: 'Status',
      render: (q: QualityCheck) => (
        <Badge variant={q.status === 'passed' ? 'success' : 'danger'}>
          {q.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Quality Checks</h1>
      <Card className="p-4">
        {query.isError ? (
          <ErrorMessage message="Quality checks could not be loaded." onRetry={() => query.refetch()} />
        ) : (
          <AdminTable columns={columns} data={query.data?.items || []} isLoading={query.isLoading} emptyMessage="No quality checks found" />
        )}
      </Card>
    </div>
  );
}
