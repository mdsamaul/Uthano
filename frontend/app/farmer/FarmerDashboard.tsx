'use client';

import { useQuery } from '@tanstack/react-query';
import { farmerService } from '@/services';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/state-components';
import { formatBDT } from '@/lib/utils';
import { Sprout, Wheat, Package, BarChart3 } from 'lucide-react';

export function FarmerDashboard() {
  const statsQuery = useQuery({
    queryKey: ['farmer', 'dashboard-stats'],
    queryFn: () => farmerService.getDashboardStats(),
  });

  if (statsQuery.isError) {
    return <ErrorMessage message="Dashboard data could not be loaded." onRetry={() => statsQuery.refetch()} />;
  }

  if (statsQuery.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const stats = statsQuery.data;

  const statCards = [
    { label: 'Total Farms', value: String(stats?.total_farms || 0), icon: Sprout, color: 'bg-green-100 text-green-700' },
    { label: 'Total Harvest', value: `${stats?.total_harvest || 0} kg`, icon: Wheat, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Total Supplied', value: `${stats?.total_supplied || 0} kg`, icon: Package, color: 'bg-blue-100 text-blue-700' },
    { label: 'Procurement Value', value: formatBDT(stats?.procurement_value || 0), icon: BarChart3, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Farmer Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {stats?.accepted_quantity !== undefined && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Supply Summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Accepted</p>
              <p className="text-xl font-bold text-success">{stats.accepted_quantity} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-xl font-bold text-danger">{stats.rejected_quantity} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Acceptance Rate</p>
              <p className="text-xl font-bold">
                {stats.accepted_quantity + stats.rejected_quantity > 0
                  ? Math.round((stats.accepted_quantity / (stats.accepted_quantity + stats.rejected_quantity)) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
