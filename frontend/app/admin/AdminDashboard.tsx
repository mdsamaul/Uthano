'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/state-components';
import { formatBDT } from '@/lib/utils';
import {
  DollarSign,
  ShoppingCart,
  Clock,
  Users,
  Sprout,
  Package,
  AlertTriangle,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminDashboard() {
  const statsQuery = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  const salesChartQuery = useQuery({
    queryKey: ['admin', 'sales-chart'],
    queryFn: () => adminService.getSalesChart(30),
  });

  const topProductsQuery = useQuery({
    queryKey: ['admin', 'top-products'],
    queryFn: () => adminService.getTopProducts(5),
  });

  const topFarmsQuery = useQuery({
    queryKey: ['admin', 'top-farms'],
    queryFn: () => adminService.getTopFarms(5),
  });

  if (statsQuery.isError) {
    return (
      <ErrorMessage
        message="Dashboard data could not be loaded."
        onRetry={() => statsQuery.refetch()}
      />
    );
  }

  if (statsQuery.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const stats = statsQuery.data;

  const statCards = [
    {
      label: 'Total Sales',
      value: formatBDT(stats?.total_sales || 0),
      icon: DollarSign,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: "Today's Orders",
      value: String(stats?.today_orders || 0),
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Pending Orders',
      value: String(stats?.pending_orders || 0),
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      label: 'Customers',
      value: String(stats?.total_customers || 0),
      icon: Users,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      label: 'Farmers',
      value: String(stats?.total_farmers || 0),
      icon: Sprout,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Products',
      value: String(stats?.total_products || 0),
      icon: Package,
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      label: 'Low Stock',
      value: String(stats?.low_stock_products || 0),
      icon: AlertTriangle,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Pending Deliveries',
      value: String(stats?.pending_deliveries || 0),
      icon: Truck,
      color: 'bg-red-100 text-red-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', card.color)}>
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

      {/* Charts & Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Sales Overview</h2>
          {salesChartQuery.isLoading ? (
            <div className="mt-4 h-64 animate-pulse rounded-lg bg-muted" />
          ) : salesChartQuery.data && salesChartQuery.data.length > 0 ? (
            <div className="mt-4">
              <div className="flex h-64 items-end gap-2">
                {salesChartQuery.data.map((point) => (
                  <div
                    key={point.date}
                    className="flex-1 rounded-t bg-primary/60 hover:bg-primary"
                    style={{
                      height: `${Math.max(
                        4,
                        (point.sales /
                          Math.max(
                            ...salesChartQuery.data.map((d) => d.sales)
                          )) *
                          90
                      )}%`,
                    }}
                    title={`${point.date}: ${formatBDT(point.sales)}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No sales data available</p>
          )}
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Top Products</h2>
          {topProductsQuery.isLoading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : topProductsQuery.data && topProductsQuery.data.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {topProductsQuery.data.map((product, index) => (
                <li key={product.product_id} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium">
                    {product.product_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {product.total_quantity} units
                  </span>
                  <span className="text-sm font-bold">
                    {formatBDT(product.total_sales)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No product data available</p>
          )}
        </Card>
      </div>

      {/* Top Farms */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Top Farms</h2>
        {topFarmsQuery.isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : topFarmsQuery.data && topFarmsQuery.data.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {topFarmsQuery.data.map((farm) => (
              <li key={farm.farm_id} className="flex items-center gap-3">
                <Sprout className="h-4 w-4 text-primary" />
                <span className="flex-1 text-sm font-medium">{farm.farm_name}</span>
                <span className="text-sm text-muted-foreground">
                  {farm.total_supply} kg
                </span>
                <span className="text-sm font-bold">{formatBDT(farm.total_value)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No farm data available</p>
        )}
      </Card>
    </div>
  );
}