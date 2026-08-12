// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

// ============================================
// User & Auth Types
// ============================================

export type UserRole = 'customer' | 'admin' | 'farmer' | 'delivery_agent';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
  expires_in?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

// ============================================
// Product Types
// ============================================

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description?: string;
  category_id: number;
  category?: Category;
  price: number;
  cost_price?: number;
  discount_price?: number;
  unit: string;
  min_order_qty: number;
  max_order_qty: number;
  images: ProductImage[];
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  is_seasonal: boolean;
  rating: number;
  review_count: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  available_qty: number;
  farm_id?: number;
  farm?: Farm;
  source_district?: string;
  harvest_date?: string;
  quality_grade?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductQuery {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  rating?: number;
  seasonal?: boolean;
  featured?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
}

// ============================================
// Category Types
// ============================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number | null;
  product_count?: number;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

// ============================================
// Farm & Farmer Types
// ============================================

export interface Farm {
  id: number;
  name: string;
  slug: string;
  farmer_id: number;
  farmer?: Farmer;
  district: string;
  upazila?: string;
  area?: string;
  description?: string;
  story?: string;
  farming_method?: string;
  images?: string[];
  is_public: boolean;
  status: 'active' | 'inactive' | 'pending';
  products?: Product[];
  crops?: FarmCrop[];
  created_at: string;
  updated_at: string;
}

export interface Farmer {
  id: number;
  user_id: number;
  user?: User;
  name: string;
  phone: string;
  district: string;
  upazila?: string;
  area?: string;
  bio?: string;
  profile_image?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface FarmCrop {
  id: number;
  farm_id: number;
  crop_name: string;
  crop_type?: string;
  variety?: string;
  season?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// ============================================
// Harvest & Batch Types
// ============================================

export interface Harvest {
  id: number;
  farm_id: number;
  farm?: Farm;
  crop_id: number;
  crop?: FarmCrop;
  harvest_date: string;
  quantity: number;
  unit: string;
  quality_grade?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  batches?: HarvestBatch[];
  created_at: string;
  updated_at: string;
}

export interface HarvestBatch {
  id: number;
  batch_code: string;
  harvest_id: number;
  harvest?: Harvest;
  product_id: number;
  product?: Product;
  quantity: number;
  unit: string;
  quality_grade: string;
  status: 'pending' | 'quality_checked' | 'approved' | 'rejected';
  quality_checked_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Inventory Types
// ============================================

export interface Inventory {
  id: number;
  product_id: number;
  product?: Product;
  batch_id: number;
  batch?: HarvestBatch;
  warehouse_id: number;
  warehouse?: Warehouse;
  available_qty: number;
  reserved_qty: number;
  damaged_qty: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  district: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// ============================================
// Cart Types
// ============================================

export interface CartItem {
  id: string;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
}

// ============================================
// Order Types
// ============================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'COD' | 'bkash' | 'nagad' | 'card';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  customer?: Customer;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_address: Address;
  expected_delivery?: string;
  delivered_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CreateOrderData {
  address_id: number;
  delivery_slot_id?: number;
  payment_method: PaymentMethod;
  notes?: string;
  items: { product_id: number; quantity: number }[];
}

// ============================================
// Customer & Address Types
// ============================================

export interface Customer {
  id: number;
  user_id: number;
  user?: User;
  name: string;
  phone: string;
  email?: string;
  addresses?: Address[];
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: number;
  customer_id: number;
  name: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  address_line: string;
  postal_code?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Review Types
// ============================================

export interface Review {
  id: number;
  product_id: number;
  product?: Product;
  customer_id: number;
  customer?: Customer;
  rating: number;
  title?: string;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// ============================================
// Coupon Types
// ============================================

export interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  max_discount?: number;
  starts_at?: string;
  expires_at?: string;
  usage_limit?: number;
  used_count: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// ============================================
// Delivery Types
// ============================================

export interface Delivery {
  id: number;
  order_id: number;
  order?: Order;
  agent_id?: number;
  agent?: User;
  zone_id?: number;
  zone?: DeliveryZone;
  status: 'pending' | 'assigned' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'failed';
  assigned_at?: string;
  delivered_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryZone {
  id: number;
  name: string;
  district: string;
  areas: string[];
  delivery_fee: number;
  estimated_days: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// ============================================
// Traceability Types
// ============================================

export interface TraceabilityStep {
  step: string;
  title: string;
  description?: string;
  date?: string;
  status: 'completed' | 'current' | 'pending';
  icon?: string;
}

export interface TraceabilityData {
  product: Product;
  farm: Farm;
  farmer: Farmer;
  harvest: Harvest;
  batch: HarvestBatch;
  quality_check?: QualityCheck;
  warehouse?: Warehouse;
  inventory?: Inventory;
  order?: Order;
  delivery?: Delivery;
}

export interface QualityCheck {
  id: number;
  batch_id: number;
  checked_by: number;
  checked_by_user?: User;
  grade: string;
  status: 'passed' | 'failed';
  notes?: string;
  checked_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Admin Dashboard Types
// ============================================

export interface DashboardStats {
  total_sales: number;
  today_orders: number;
  pending_orders: number;
  total_customers: number;
  total_farmers: number;
  total_products: number;
  low_stock_products: number;
  pending_deliveries: number;
}

export interface SalesChartData {
  date: string;
  sales: number;
  orders: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_sales: number;
}

export interface TopFarm {
  farm_id: number;
  farm_name: string;
  total_supply: number;
  total_value: number;
}

// ============================================
// Farmer Portal Types
// ============================================

export interface FarmerDashboardStats {
  total_farms: number;
  total_harvest: number;
  total_supplied: number;
  accepted_quantity: number;
  rejected_quantity: number;
  procurement_value: number;
}

export interface SourcingRecord {
  id: number;
  batch_id: number;
  batch?: HarvestBatch;
  farmer_id: number;
  farm_id: number;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_value: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

// ============================================
// Wishlist Types
// ============================================

export interface WishlistItem {
  id: number;
  customer_id: number;
  product_id: number;
  product?: Product;
  created_at: string;
  updated_at: string;
}