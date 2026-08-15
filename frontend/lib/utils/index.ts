import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// Currency Formatting
// ============================================

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// ============================================
// Date Formatting
// ============================================

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];

  for (const [secondsIn, unit] of intervals) {
    const interval = Math.floor(seconds / secondsIn);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }

  return 'just now';
}

// ============================================
// String Utilities
// ============================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// ============================================
// Number Utilities
// ============================================

export function formatNumber(num: number): string {
  return num.toLocaleString('en-BD');
}

export function formatQuantity(qty: number, unit: string): string {
  return `${qty} ${unit}`;
}

// ============================================
// Phone Utilities
// ============================================

export function formatPhone(phone: string): string {
  // Format: 01XXXXXXXXX -> +880 1XX XXX XXXX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return `+880 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

// ============================================
// URL Utilities
// ============================================

export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// ============================================
// Image URL Helpers
// ============================================

/**
 * Resolve backend file URLs (e.g. `/storage/products/xyz.jpg`) to a fully
 * qualified URL served from the API origin, so images render correctly when
 * the frontend (Next.js) and backend (Laravel) run on different ports.
 * Absolute URLs (https://... from a CDN/cloud host) pass through unchanged.
 */
export function getImageUrl(url?: string | null): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || /^data:/i.test(url)) return url;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const origin = apiBase.replace(/\/api\/v\d+\/?$/, '').replace(/\/+$/, '');
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
}

// ============================================
// Validation Helpers
// ============================================

export function isValidPhone(phone: string): boolean {
  return /^01[3-9]\d{8}$/.test(phone.replace(/\D/g, ''));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// Order Status Helpers
// ============================================

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  packed: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// export const PAYMENT_METHOD_LABELS: Record<string, string> = {
//   COD: 'Cash on Delivery',
//   bkash: 'bKash',
//   nagad: 'Nagad',
//   card: 'Card',
// };

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  ONLINE: 'Online Payment',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};

// ============================================
// Stock Status Helpers
// ============================================

export const STOCK_STATUS_LABELS: Record<string, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

export const STOCK_STATUS_COLORS: Record<string, string> = {
  in_stock: 'bg-green-100 text-green-800',
  low_stock: 'bg-yellow-100 text-yellow-800',
  out_of_stock: 'bg-red-100 text-red-800',
};

// ============================================
// Product Status Helpers
// ============================================

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
  discontinued: 'Discontinued',
};

export const PRODUCT_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-700',
  discontinued: 'bg-red-100 text-red-800',
};

// ============================================
// Bangladesh Divisions
// ============================================

export const BANGLADESH_DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];

// ============================================
// Error Message Extraction
// ============================================

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred.';
}