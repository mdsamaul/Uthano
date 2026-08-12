'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/state-components';
import { formatBDT } from '@/lib/utils';

export function ReportsClient() {
  const salesReportQuery = useQuery({
    queryKey: ['admin', 'reports', 'sales'],
    queryFn: () => adminService.getSalesChart(30),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Sales Report (Last 30 Days)</h2>
        {salesReportQuery.isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : salesReportQuery.isError ? (
          <ErrorMessage message="Report could not be loaded." onRetry={() => salesReportQuery.refetch()} />
        ) : (
          <div className="mt-4 space-y-3">
            {salesReportQuery.data?.map((item) => (
              <div key={item.date} className="flex justify-between border-b border-border pb-2">
                <span className="text-sm">{item.date}</span>
                <span className="font-medium">{formatBDT(item.sales)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
