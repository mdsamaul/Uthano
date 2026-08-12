import { apiGet } from '@/lib/api/client';
import { Farm, PaginatedData } from '@/types';
import { buildQueryString } from '@/lib/utils';

export const farmService = {
  async getFarms(page = 1, perPage = 20): Promise<PaginatedData<Farm>> {
    const query = buildQueryString({ page, per_page: perPage });
    return apiGet<PaginatedData<Farm>>(`/farms${query}`);
  },

  async getFarm(slug: string): Promise<Farm> {
    return apiGet<Farm>(`/farms/${slug}`);
  },

  async getFeaturedFarms(): Promise<Farm[]> {
    return apiGet<Farm[]>('/farms/featured');
  },
};