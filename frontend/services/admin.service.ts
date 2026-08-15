import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';
import {
  AccessCatalog,
  AdminUserFormValues,
  AuditLog,
  Category,
  Coupon,
  Customer,
  DashboardStats,
  Delivery,
  AdminFarm,
  AdminFarmer,
  Harvest,
  HarvestBatch,
  Inventory,
  MyAccess,
  Order,
  PaginatedData,
  Product,
  QualityCheck,
  Role,
  SalesChartData,
  TopFarm,
  TopProduct,
  Unit,
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

  async createProduct(data: Record<string, unknown> | FormData): Promise<Product> {
    return apiPost<Product>('/admin/products', data);
  },

  async updateProduct(id: number, data: Record<string, unknown> | FormData): Promise<Product> {
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

  // Units (product form selects)
  async getUnits(): Promise<Unit[]> {
    return apiGet<Unit[]>('/admin/units');
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
    return apiPost<Order>(`/admin/orders/${id}/status`, { status });
  },

  // Customers
  async getCustomers(page = 1, perPage = 20, search?: string): Promise<PaginatedData<Customer>> {
    const query = buildQueryString({ page, per_page: perPage, search });
    return apiGet<PaginatedData<Customer>>(`/admin/customers${query}`);
  },

  async getCustomer(id: number): Promise<Customer> {
    return apiGet<Customer>(`/admin/customers/${id}`);
  },

  async createCustomer(data: { full_name: string; phone: string }): Promise<Customer> {
    return apiPost<Customer>('/admin/customers', data);
  },

  // Farmers
  async getFarmers(page = 1, perPage = 20, search?: string): Promise<PaginatedData<AdminFarmer>> {
    const query = buildQueryString({ page, per_page: perPage, search });
    return apiGet<PaginatedData<AdminFarmer>>(`/admin/farmers${query}`);
  },

  async createFarmer(data: Partial<AdminFarmer>): Promise<AdminFarmer> {
    return apiPost<AdminFarmer>('/admin/farmers', data);
  },

  async updateFarmer(id: number, data: Partial<AdminFarmer>): Promise<AdminFarmer> {
    return apiPut<AdminFarmer>(`/admin/farmers/${id}`, data);
  },

  // Farms
  async getFarms(page = 1, perPage = 20, search?: string, status?: string): Promise<PaginatedData<AdminFarm>> {
    const query = buildQueryString({ page, per_page: perPage, search, status });
    return apiGet<PaginatedData<AdminFarm>>(`/admin/farms${query}`);
  },

  async createFarm(data: Partial<AdminFarm>): Promise<AdminFarm> {
    return apiPost<AdminFarm>('/admin/farms', data);
  },

  async updateFarm(id: number, data: Partial<AdminFarm>): Promise<AdminFarm> {
    return apiPut<AdminFarm>(`/admin/farms/${id}`, data);
  },

  async deleteFarm(id: number): Promise<void> {
    await apiDelete<void>(`/admin/farms/${id}`);
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

  async receiveInventory(data: {
    product_id: number;
    harvest_batch_id: number;
    warehouse_id: number;
    quantity: number;
    unit_id: number;
    notes?: string;
  }): Promise<Inventory> {
    return apiPost<Inventory>('/admin/inventory/receive', data);
  },

  async stockOut(
    id: number,
    data: { quantity: number; reason: string; notes?: string }
  ): Promise<Inventory> {
    return apiPost<Inventory>(`/admin/inventory/${id}/stock-out`, data);
  },

  async updateInventory(id: number, data: Partial<Inventory>): Promise<Inventory> {
    return apiPut<Inventory>(`/admin/inventory/${id}`, data);
  },

  // Warehouses
    async getWarehouses(): Promise<PaginatedData<Warehouse>> {
    return apiGet<PaginatedData<Warehouse>>('/admin/warehouses');
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

  // Delivery Agents (for assignment)
  async getDeliveryAgents(): Promise<User[]> {
    return apiGet<User[]>('/admin/delivery-agents');
  },

  // ============================================
  // Access management (users / roles / permissions)
  // ============================================

  async getMyAccess(): Promise<MyAccess> {
    return apiGet<MyAccess>('/admin/access/my');
  },

  async getAccessCatalog(): Promise<AccessCatalog> {
    return apiGet<AccessCatalog>('/admin/access/catalog');
  },

  async getUsers(page = 1, perPage = 20, search?: string, role?: string): Promise<PaginatedData<User>> {
    const query = buildQueryString({ page, per_page: perPage, search, role });
    return apiGet<PaginatedData<User>>(`/admin/users${query}`);
  },

  async getUser(id: number): Promise<User> {
    return apiGet<User>(`/admin/users/${id}`);
  },

  async createUser(data: Partial<AdminUserFormValues> & { password: string }): Promise<User> {
    return apiPost<User>('/admin/users', data);
  },

  async updateUser(id: number, data: Partial<AdminUserFormValues>): Promise<User> {
    return apiPut<User>(`/admin/users/${id}`, data);
  },

  async deleteUser(id: number): Promise<void> {
    await apiDelete<void>(`/admin/users/${id}`);
  },

  async toggleUserStatus(id: number): Promise<User> {
    return apiPost<User>(`/admin/users/${id}/toggle`);
  },

  async updateUserRoles(id: number, roles: string[]): Promise<User> {
    return apiPut<User>(`/admin/users/${id}/roles`, { roles });
  },

  async updateUserPermissions(id: number, permissions: number[]): Promise<User> {
    return apiPut<User>(`/admin/users/${id}/permissions`, { permissions });
  },

  async getRoles(): Promise<Role[]> {
    return apiGet<Role[]>('/admin/roles');
  },

  async getRole(id: number): Promise<Role> {
    return apiGet<Role>(`/admin/roles/${id}`);
  },

  async createRole(data: { name: string; slug: string; description?: string; permissions?: number[] }): Promise<Role> {
    return apiPost<Role>('/admin/roles', data);
  },

  async updateRole(id: number, data: { name?: string; slug?: string; description?: string; permissions?: number[] }): Promise<Role> {
    return apiPut<Role>(`/admin/roles/${id}`, data);
  },

  async deleteRole(id: number): Promise<void> {
    await apiDelete<void>(`/admin/roles/${id}`);
  },

  async updateRolePermissions(id: number, permissions: number[]): Promise<Role> {
    return apiPut<Role>(`/admin/roles/${id}/permissions`, { permissions });
  },

  // ============================================
  // Coupons
  // ============================================

  async getCoupons(page = 1, perPage = 20, search?: string): Promise<PaginatedData<Coupon>> {
    const query = buildQueryString({ page, per_page: perPage, search });
    return apiGet<PaginatedData<Coupon>>(`/admin/coupons${query}`);
  },

  async getCoupon(id: number): Promise<Coupon> {
    return apiGet<Coupon>(`/admin/coupons/${id}`);
  },

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    return apiPost<Coupon>('/admin/coupons', data);
  },

  async updateCoupon(id: number, data: Partial<Coupon>): Promise<Coupon> {
    return apiPut<Coupon>(`/admin/coupons/${id}`, data);
  },

  async deleteCoupon(id: number): Promise<void> {
    await apiDelete<void>(`/admin/coupons/${id}`);
  },

  async toggleCoupon(id: number): Promise<Coupon> {
    return apiPost<Coupon>(`/admin/coupons/${id}/toggle`);
  },

  // ============================================
  // Audit logs
  // ============================================

  async getAuditLogs(page = 1, perPage = 20, filters?: { action?: string; user_id?: number; from?: string; to?: string }): Promise<PaginatedData<AuditLog>> {
    const query = buildQueryString({ page, per_page: perPage, ...filters });
    return apiGet<PaginatedData<AuditLog>>(`/admin/audit-logs${query}`);
  },
};