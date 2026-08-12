import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';
import {
  Category,
  Customer,
  DashboardStats,
  Delivery,
  Farm,
  Farmer,
  Harvest,
  HarvestBatch,
  Inventory,
  Order,
  PaginatedData,
  Product,
  QualityCheck,
  SalesChartData,
  TopFarm,
  TopProduct,
  User,
  Warehouse,
} from '@/types';
import { buildQueryString } from '@/lib/utils';

export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return apiGet<DashboardStats>('/admin/dashboard/stats');
  },

  async getSalesChart(days = 30): Promise<SalesChartData[]> {
    return apiGet<SalesChartData[]>(`/admin/dashboard/sales-chart?days=${days}`);
  },

  async getTopProducts(limit = 10): Promise<TopProduct[]> {
    return apiGet<TopProduct[]>(`/admin/dashboard/top-products?limit=${limit}`);
  },

  async getTopFarms(limit = 10): Promise<TopFarm[]> {
    return apiGet<TopFarm[]>(`/admin/dashboard/top-farms?limit=${limit}`);
  },

  // Products
  async getProducts(page = 1, perPage = 20, search?: string): Promise<PaginatedData<Product>> {
    const query = buildQueryString({ page, per_page: perPage, search });
    return apiGet<PaginatedData<Product>>(`/admin/products${query}`);
  },

  async getProduct(id: number): Promise<Product> {
    return apiGet<Product>(`/admin/products/${id}`);
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    return apiPost<Product>('/admin/products', data);
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    return apiPut<Product>(`/admin/products/${id}`, data);
  },

  async deleteProduct(id: number): Promise<void> {
    await apiDelete<void>(`/admin/products/${id}`);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return apiGet<Category[]>('/admin/categories');
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    return apiPost<Category>('/admin/categories', data);
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    return apiPut<Category>(`/admin/categories/${id}`, data);
  },

  async deleteCategory(id: number): Promise<void> {
    await apiDelete<void>(`/admin/categories/${id}`);
  },

  // Orders
  async getOrders(page = 1, perPage = 20, status?: string): Promise<PaginatedData<Order>> {
    const query = buildQueryString({ page, per_page: perPage, status });
    return apiGet<PaginatedData<Order>>(`/admin/orders${query}`);
  },

  async getOrder(id: number): Promise<Order> {
    return apiGet<Order>(`/admin/orders/${id}`);
  },

  async updateOrderStatus(id: number, status: Order['status']): Promise<Order> {
    return apiPut<Order>(`/admin/orders/${id}/status`, { status });
  },

  // Customers
  async getCustomers(page = 1, perPage = 20, search?: string): Promise<PaginatedData<Customer>> {
    const query = buildQueryString({ page, per_page: perPage, search });
    return apiGet<PaginatedData<Customer>>(`/admin/customers${query}`);
  },

  async getCustomer(id: number): Promise<Customer> {
    return apiGet<Customer>(`/admin/customers/${id}`);
  },

  // Farmers
  async getFarmers(page = 1, perPage = 20, search?: string): Promise<PaginatedData<Farmer>> {
    const query = buildQueryString({ page, per_page: perPage, search });
    return apiGet<PaginatedData<Farmer>>(`/admin/farmers${query}`);
  },

  async createFarmer(data: Partial<Farmer>): Promise<Farmer> {
    return apiPost<Farmer>('/admin/farmers', data);
  },

  async updateFarmer(id: number, data: Partial<Farmer>): Promise<Farmer> {
    return apiPut<Farmer>(`/admin/farmers/${id}`, data);
  },

  // Farms
  async getFarms(page = 1, perPage = 20, search?: string): Promise<PaginatedData<Farm>> {
    const query = buildQueryString({ page, per_page: perPage, search });
    return apiGet<PaginatedData<Farm>>(`/admin/farms${query}`);
  },

  async createFarm(data: Partial<Farm>): Promise<Farm> {
    return apiPost<Farm>('/admin/farms', data);
  },

  async updateFarm(id: number, data: Partial<Farm>): Promise<Farm> {
    return apiPut<Farm>(`/admin/farms/${id}`, data);
  },

  // Harvests
  async getHarvests(page = 1, perPage = 20): Promise<PaginatedData<Harvest>> {
    const query = buildQueryString({ page, per_page: perPage });
    return apiGet<PaginatedData<Harvest>>(`/admin/harvests${query}`);
  },

  async createHarvest(data: Partial<Harvest>): Promise<Harvest> {
    return apiPost<Harvest>('/admin/harvests', data);
  },

  // Batches
  async getBatches(page = 1, perPage = 20): Promise<PaginatedData<HarvestBatch>> {
    const query = buildQueryString({ page, per_page: perPage });
    return apiGet<PaginatedData<HarvestBatch>>(`/admin/batches${query}`);
  },

  async createBatch(data: Partial<HarvestBatch>): Promise<HarvestBatch> {
    return apiPost<HarvestBatch>('/admin/batches', data);
  },

  // Inventory
  async getInventory(page = 1, perPage = 20): Promise<PaginatedData<Inventory>> {
    const query = buildQueryString({ page, per_page: perPage });
    return apiGet<PaginatedData<Inventory>>(`/admin/inventory${query}`);
  },

  async updateInventory(id: number, data: Partial<Inventory>): Promise<Inventory> {
    return apiPut<Inventory>(`/admin/inventory/${id}`, data);
  },

  // Warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    return apiGet<Warehouse[]>('/admin/warehouses');
  },

  async createWarehouse(data: Partial<Warehouse>): Promise<Warehouse> {
    return apiPost<Warehouse>('/admin/warehouses', data);
  },

  // Deliveries
  async getDeliveries(page = 1, perPage = 20): Promise<PaginatedData<Delivery>> {
    const query = buildQueryString({ page, per_page: perPage });
    return apiGet<PaginatedData<Delivery>>(`/admin/deliveries${query}`);
  },

  async assignDeliveryAgent(deliveryId: number, agentId: number): Promise<Delivery> {
    return apiPost<Delivery>(`/admin/deliveries/${deliveryId}/assign`, { agent_id: agentId });
  },

  // Quality Checks
  async getQualityChecks(page = 1, perPage = 20): Promise<PaginatedData<QualityCheck>> {
    const query = buildQueryString({ page, per_page: perPage });
    return apiGet<PaginatedData<QualityCheck>>(`/admin/quality-checks${query}`);
  },

  async createQualityCheck(data: Partial<QualityCheck>): Promise<QualityCheck> {
    return apiPost<QualityCheck>('/admin/quality-checks', data);
  },

  // Traceability
  async getTraceability(batchCode: string): Promise<unknown> {
    return apiGet<unknown>(`/admin/traceability/${batchCode}`);
  },

  // Users (for delivery agents)
  async getDeliveryAgents(): Promise<User[]> {
    return apiGet<User[]>('/admin/users/delivery-agents');
  },
};