'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore, useUIStore } from '@/store';
import { formatBDT, getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function CartDrawer() {
  const { isCartDrawerOpen, setCartDrawerOpen } = useUIStore();
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount } =
    useCartStore();

  if (!isCartDrawerOpen) return null;

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={() => setCartDrawerOpen(false)}
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-modal animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Cart ({itemCount})
          </h2>
          <button
            onClick={() => setCartDrawerOpen(false)}
            className="rounded-md p-1 hover:bg-muted"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Your cart is empty</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add some fresh products from our farms
            </p>
            <Link href="/products" className="mt-6">
              <Button>Shop Fresh</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.product?.images?.[0]?.url ? (
                        <Image
                          src={getImageUrl(item.product.images[0].url)}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium line-clamp-1">
                            {item.product?.name || `Product #${item.product_id}`}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatBDT(item.unit_price)} / {item.product?.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-danger"
                          aria-label={`Remove ${item.product?.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-border">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1.5 hover:bg-muted"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1.5 hover:bg-muted"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatBDT(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold">{formatBDT(subtotal)}</span>
              </div>
              <Link href="/cart" className="block w-full">
                <Button
                  className="w-full"
                  onClick={() => setCartDrawerOpen(false)}
                >
                  View Cart
                </Button>
              </Link>
              <Link href="/checkout" className="block w-full mt-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setCartDrawerOpen(false)}
                >
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}