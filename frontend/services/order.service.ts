import { apiGet, apiPost } from '@/lib/api/client';
import { CreateOrderData, Order, PaginatedData } from '@/types';
import { buildQueryString } from '@/lib/utils';

export const orderService = {
  async getOrders(page = 1, perPage = 20): Promise<PaginatedData<Order>> {
    const query = buildQueryString({ page, per_page: perPage });
    return apiGet<PaginatedData<Order>>(`/orders${query}`);
  },

  async getOrder(orderNumber: string): Promise<Order> {
    return apiGet<Order>(`/orders/${orderNumber}`);
  },

  async createOrder(data: CreateOrderData): Promise<Order> {
    return apiPost<Order>('/orders', data);
  },

  async getOrderTracking(orderNumber: string): Promise<Order> {
    return apiGet<Order>(`/orders/${orderNumber}/tracking`);
  },

  async cancelOrder(orderNumber: string): Promise<Order> {
    return apiPost<Order>(`/orders/${orderNumber}/cancel`);
  },
};