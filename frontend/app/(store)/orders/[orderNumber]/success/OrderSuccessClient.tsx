'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function OrderSuccessClient() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params?.orderNumber || '';

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-3xl font-bold">Order Placed Successfully!</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you for shopping with UTHANO. Your order has been confirmed.
        </p>
      </div>

      <Card className="mt-8 p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-sm text-muted-foreground">Order Number</p>
            <p className="mt-1 text-lg font-bold text-primary">{orderNumber}</p>
          </div>
          <Package className="h-8 w-8 text-primary" />
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium">Cash on Delivery</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expected Delivery</span>
            <span className="font-medium">1-3 business days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-primary">Order Placed</span>
          </div>
        </div>
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href={`/orders/${orderNumber}`} className="flex-1">
          <Button className="w-full" size="lg">
            Track Order
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/products" className="flex-1">
          <Button variant="outline" className="w-full" size="lg">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}