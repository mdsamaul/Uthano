import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';
import { Address, Customer, Review, WishlistItem } from '@/types';

export const customerService = {
  // Profile
  async getProfile(): Promise<Customer> {
    return apiGet<Customer>('/customer/profile');
  },

  async updateProfile(data: Partial<Customer>): Promise<Customer> {
    return apiPut<Customer>('/customer/profile', data);
  },

  // Addresses
  async getAddresses(): Promise<Address[]> {
    return apiGet<Address[]>('/customer/addresses');
  },

  async createAddress(data: Omit<Address, 'id' | 'customer_id' | 'created_at' | 'updated_at'>): Promise<Address> {
    return apiPost<Address>('/customer/addresses', data);
  },

  async updateAddress(id: number, data: Partial<Address>): Promise<Address> {
    return apiPut<Address>(`/customer/addresses/${id}`, data);
  },

  async deleteAddress(id: number): Promise<void> {
    await apiDelete<void>(`/customer/addresses/${id}`);
  },

  async setDefaultAddress(id: number): Promise<Address> {
    return apiPost<Address>(`/customer/addresses/${id}/default`);
  },

  // Reviews
  async getMyReviews(): Promise<Review[]> {
    return apiGet<Review[]>('/customer/reviews');
  },

  async createReview(data: {
    product_id: number;
    rating: number;
    title?: string;
    comment?: string;
  }): Promise<Review> {
    return apiPost<Review>('/customer/reviews', data);
  },

  // Wishlist
  async getWishlist(): Promise<WishlistItem[]> {
    return apiGet<WishlistItem[]>('/customer/wishlist');
  },

  async addToWishlist(productId: number): Promise<WishlistItem> {
    return apiPost<WishlistItem>('/customer/wishlist', { product_id: productId });
  },

  async removeFromWishlist(productId: number): Promise<void> {
    await apiDelete<void>(`/customer/wishlist/${productId}`);
  },
};