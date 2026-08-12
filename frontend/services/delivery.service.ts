import { apiGet, apiPost, apiPut } from '@/lib/api/client';
import { Delivery, DeliveryZone, PaginatedData } from '@/types';
import { buildQueryString } from '@/lib/utils';

export const deliveryService = {
  // Public
  async getZones(): Promise<DeliveryZone[]> {
    return apiGet<DeliveryZone[]>('/delivery/zones');
  },

  // Delivery Agent
  async getMyDeliveries(page = 1, perPage = 20): Promise<PaginatedData<Delivery>> {
    const query = buildQueryString({ page, per_page: perPage });
    return apiGet<PaginatedData<Delivery>>(`/delivery/agent/deliveries${query}`);
  },

  async getDelivery(id: number): Promise<Delivery> {
    return apiGet<Delivery>(`/delivery/agent/deliveries/${id}`);
  },

  async updateDeliveryStatus(
    id: number,
    status: Delivery['status'],
    notes?: string
  ): Promise<Delivery> {
    return apiPut<Delivery>(`/delivery/agent/deliveries/${id}/status`, {
      status,
      notes,
    });
  },

  async getCompletedDeliveries(page = 1, perPage = 20): Promise<PaginatedData<Delivery>> {
    const query = buildQueryString({ page, per_page: perPage });
    return apiGet<PaginatedData<Delivery>>(`/delivery/agent/completed${query}`);
  },
};
