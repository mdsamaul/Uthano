import { z } from 'zod';

// ============================================
// Auth Validations
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .regex(/^01[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

// ============================================
// Address Validations
// ============================================

export const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number'),
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
  upazila: z.string().min(1, 'Upazila is required'),
  area: z.string().min(1, 'Area is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  postal_code: z.string().optional(),
  is_default: z.boolean().default(false),
});

// ============================================
// Checkout Validations
// ============================================

export const checkoutSchema = z.object({
  address_id: z.number().min(1, 'Please select a delivery address'),
  payment_method: z.enum(['cod', 'bkash', 'nagad', 'card']),
  notes: z.string().optional(),
});

// ============================================
// Product Validations (Admin)
// ============================================

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  category_id: z.number().min(1, 'Category is required'),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  cost_price: z.number().min(0, 'Cost price must be positive').optional(),
  discount_price: z.number().min(0, 'Discount price must be positive').optional(),
  unit: z.string().min(1, 'Unit is required'),
  min_order_qty: z.number().min(1, 'Minimum order quantity must be at least 1'),
  max_order_qty: z.number().min(1, 'Maximum order quantity must be at least 1'),
  status: z.enum(['active', 'inactive', 'draft']),
  featured: z.boolean().default(false),
  is_seasonal: z.boolean().default(false),
});

// ============================================
// Farm Validations (Admin)
// ============================================

export const farmSchema = z.object({
  name: z.string().min(2, 'Farm name is required'),
  farmer_id: z.number().min(1, 'Farmer is required'),
  district: z.string().min(1, 'District is required'),
  upazila: z.string().optional(),
  area: z.string().optional(),
  description: z.string().optional(),
  story: z.string().optional(),
  farming_method: z.string().optional(),
  is_public: z.boolean().default(true),
  status: z.enum(['active', 'inactive', 'pending']),
});

// ============================================
// Harvest Validations (Admin)
// ============================================

export const harvestSchema = z.object({
  farm_id: z.number().min(1, 'Farm is required'),
  crop_id: z.number().min(1, 'Crop is required'),
  harvest_date: z.string().min(1, 'Harvest date is required'),
  quantity: z.number().min(0.01, 'Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  quality_grade: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================
// Batch Validations (Admin)
// ============================================

export const batchSchema = z.object({
  harvest_id: z.number().min(1, 'Harvest is required'),
  product_id: z.number().min(1, 'Product is required'),
  quantity: z.number().min(0.01, 'Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  quality_grade: z.string().min(1, 'Quality grade is required'),
});

// ============================================
// Coupon Validations
// ============================================

export const couponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters'),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(0, 'Value must be positive'),
  min_order_amount: z.number().min(0).optional(),
  max_discount: z.number().min(0).optional(),
  starts_at: z.string().optional(),
  expires_at: z.string().optional(),
  usage_limit: z.number().min(1).optional(),
  status: z.enum(['active', 'inactive']),
});

// ============================================
// Review Validations
// ============================================

export const reviewSchema = z.object({
  product_id: z.number().min(1),
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().optional(),
  comment: z.string().min(5, 'Review must be at least 5 characters').optional(),
});

// ============================================
// Type Exports
// ============================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type FarmFormData = z.infer<typeof farmSchema>;
export type HarvestFormData = z.infer<typeof harvestSchema>;
export type BatchFormData = z.infer<typeof batchSchema>;
export type CouponFormData = z.infer<typeof couponSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;