import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity) => {
        const { items } = get();
        const existingItem = items.find(
          (item) => item.product_id === product.id
        );

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            product.max_order_qty || 100
          );
          set({
            items: items.map((item) =>
              item.product_id === product.id
                ? {
                    ...item,
                    quantity: newQuantity,
                    subtotal: newQuantity * item.unit_price,
                  }
                : item
            ),
          });
        } else {
          const unitPrice = product.discount_price || product.price;
          const newItem: CartItem = {
            id: `local-${product.id}-${Date.now()}`,
            product_id: product.id,
            product,
            quantity,
            unit_price: unitPrice,
            subtotal: unitPrice * quantity,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (itemId) => {
        set({
          items: get().items.filter((item) => item.id !== itemId),
        });
      },

      updateQuantity: (itemId, quantity) => {
        set({
          items: get().items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity: Math.max(1, quantity),
                  subtotal: Math.max(1, quantity) * item.unit_price,
                }
              : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.subtotal, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },
    }),
    {
      name: 'uthano-cart',
    }
  )
);