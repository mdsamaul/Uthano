'use client';

import { useQuery } from '@tanstack/react-query';
import { farmerService } from '@/services';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/state-components';
import { formatBDT } from '@/lib/utils';
import { Sprout, Wheat, Package } from 'lucide-react';

export function FarmerStatisticsClient() {
  const query = useQuery({
    queryKey: ['farmer', 'statistics'],
    queryFn: () => farmerService.getStatistics(),
  });

  if (query.isError) {
    return <ErrorMessage message="Statistics could not be loaded." onRetry={() => query.refetch()} />;
  }

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const stats = query.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Statistics</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 text-center">
          <Sprout className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{stats?.total_farms || 0}</p>
          <p className="text-sm text-muted-foreground">Total Farms</p>
        </Card>
        <Card className="p-4 text-center">
          <Wheat className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{stats?.total_harvest || 0} kg</p>
          <p className="text-sm text-muted-foreground">Total Harvest</p>
        </Card>
        <Card className="p-4 text-center">
          <Package className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{stats?.total_supplied || 0} kg</p>
          <p className="text-sm text-muted-foreground">Total Supplied</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Procurement Value</h2>
        <p className="mt-2 text-2xl font-bold">{formatBDT(stats?.procurement_value || 0)}</p>
      </Card>
    </div>
  );
}
