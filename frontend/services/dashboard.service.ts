import { adminService } from '@/services/admin.service';
import { DashboardStats, SalesChartData, TopFarm, TopProduct } from '@/types';

export const dashboardService = {
  async stats(): Promise<DashboardStats> {
    return adminService.getDashboardStats();
  },
  async salesChart(days = 30): Promise<SalesChartData[]> {
    return adminService.getSalesChart(days);
  },
  async topProducts(limit = 10): Promise<TopProduct[]> {
    return adminService.getTopProducts(limit);
  },
  async topFarms(limit = 10): Promise<TopFarm[]> {
    return adminService.getTopFarms(limit);
  },
};