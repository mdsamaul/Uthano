import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isCartDrawerOpen: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  setMobileMenuOpen: (isOpen: boolean) => void;
  setSearchOpen: (isOpen: boolean) => void;
  setCartDrawerOpen: (isOpen: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCartDrawerOpen: false,
  toast: null,

  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
  setCartDrawerOpen: (isOpen) => set({ isCartDrawerOpen: isOpen }),

  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      set({ toast: null });
    }, 3000);
  },

  hideToast: () => set({ toast: null }),
}));