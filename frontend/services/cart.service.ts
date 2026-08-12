import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';
import { Cart, CartItem } from '@/types';

export const cartService = {
  async getCart(): Promise<Cart> {
    return apiGet<Cart>('/cart');
  },

  async addItem(productId: number, quantity: number): Promise<Cart> {
    return apiPost<Cart>('/cart/items', { product_id: productId, quantity });
  },

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    return apiPut<Cart>(`/cart/items/${itemId}`, { quantity });
  },

  async removeItem(itemId: string): Promise<Cart> {
    return apiDelete<Cart>(`/cart/items/${itemId}`);
  },

  async clearCart(): Promise<void> {
    await apiDelete<void>('/cart');
  },

  async applyCoupon(code: string): Promise<Cart> {
    return apiPost<Cart>('/cart/coupon', { code });
  },

  async removeCoupon(): Promise<Cart> {
    return apiDelete<Cart>('/cart/coupon');
  },
};