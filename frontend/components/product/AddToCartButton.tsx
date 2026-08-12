'use client';

import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/types';
import { useCartStore, useUIStore } from '@/store';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function AddToCartButton({
  product,
  quantity = 1,
  size = 'default',
  className,
  disabled,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const showToast = useUIStore((state) => state.showToast);
  const [added, setAdded] = useState(false);

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    default: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    addItem(product, quantity);
    setIsOpen(true);
    showToast(`${product.name} added to cart`);

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md bg-primary font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        sizes[size],
        className
      )}
      aria-label={`Add ${product.name} to cart`}
    >
      {added ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {added ? 'Added!' : 'Add to Cart'}
    </button>
  );
}