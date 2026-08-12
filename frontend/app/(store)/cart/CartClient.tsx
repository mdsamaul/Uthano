'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store';
import { formatBDT } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/common/state-components';

export function CartClient() {
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount, clearCart } =
    useCartStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>
        <EmptyState
          title="Your cart is empty"
          description="Add some fresh products from our farms to get started"
          icon={<ShoppingBag className="h-6 w-6" />}
          action={
            <Link href="/products">
              <Button>
                Shop Fresh
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-muted-foreground hover:text-danger"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 rounded-lg border border-border bg-card p-4"
              >
                <Link
                  href={`/products/${item.product?.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted"
                >
                  {item.product?.images?.[0]?.url ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/products/${item.product?.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {item.product?.name || `Product #${item.product_id}`}
                      </Link>
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

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-md border border-border">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="font-semibold">{formatBDT(item.subtotal)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Items ({itemCount})</dt>
                <dd className="font-medium">{formatBDT(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Delivery Fee</dt>
                <dd className="font-medium">Calculated at checkout</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="font-medium">Calculated at checkout</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <dt className="font-semibold">Subtotal</dt>
                <dd className="text-lg font-bold">{formatBDT(subtotal)}</dd>
              </div>
            </dl>
            <Link href="/checkout" className="mt-6 block w-full">
              <Button size="lg" className="w-full">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="/products"
              className="mt-3 block text-center text-sm text-muted-foreground hover:text-primary"
            >
              Continue Shopping
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}