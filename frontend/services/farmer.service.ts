import { apiGet } from '@/lib/api/client';
import {
  Farm,
  Farmer,
  FarmerDashboardStats,
  Harvest,
  HarvestBatch,
  PaginatedData,
  SourcingRecord,
} from '@/types';
import { buildQueryString } from '@/lib/utils';

export const farmerService = {
  // Dashboard
  async getDashboardStats(): Promise<FarmerDashboardStats> {
    return apiGet<FarmerDashboardStats>('/farmer/dashboard/stats');
  },

  // Farms
  async getMyFarms(): Promise<Farm[]> {
    return apiGet<Farm[]>('/farmer/farms');
  },

  async getFarm(id: number): Promise<Farm> {
    return apiGet<Farm>(`/farmer/farms/${id}`);
  },

  // Harvests
  async getMyHarvests(page = 1, perPage = 20): Promise<PaginatedData<Harvest>> {
    const query = buildQueryString({ page, per_page: perPage });
    return apiGet<PaginatedData<Harvest>>(`/farmer/harvests${query}`);
  },

  // Batches
  async getMyBatches(page = 1, perPage = 20): Promise<PaginatedData<HarvestBatch>> {
    const query = buildQueryString({ page, per_page: perPage });
    return apiGet<PaginatedData<HarvestBatch>>(`/farmer/batches${query}`);
  },

  // Sourcing
  async getMySourcing(page = 1, perPage = 20): Promise<PaginatedData<SourcingRecord>> {
    const query = buildQueryString({ page, per_page: perPage });
    return apiGet<PaginatedData<SourcingRecord>>(`/farmer/sourcing${query}`);
  },

  // Statistics
  async getStatistics(): Promise<FarmerDashboardStats> {
    return apiGet<FarmerDashboardStats>('/farmer/statistics');
  },
};