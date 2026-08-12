'use client';

import { MapPin, Sprout, Leaf, Package, ShieldCheck } from 'lucide-react';
import { Farm } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductGrid } from '@/components/product/ProductGrid';

interface FarmDetailClientProps {
  farm: Farm;
}

export function FarmDetailClient({ farm }: FarmDetailClientProps) {
  const products = farm.products || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Farm Header */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-light to-secondary/10 p-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
            <Sprout className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{farm.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {farm.district}
              {farm.upazila && `, ${farm.upazila}`}
            </p>
          </div>
          <Badge variant="success" className="ml-auto">
            {farm.status}
          </Badge>
        </div>
      </div>

      {/* Farm Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-4 text-center">
          <Leaf className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{farm.crops?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Crops Grown</p>
        </Card>
        <Card className="p-4 text-center">
          <Package className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">{products.length}</p>
          <p className="text-sm text-muted-foreground">Available Products</p>
        </Card>
        <Card className="p-4 text-center">
          <ShieldCheck className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-2xl font-bold">Quality</p>
          <p className="text-sm text-muted-foreground">Checked</p>
        </Card>
      </div>

      {/* Farm Story */}
      {farm.story && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Know Your Farm</h2>
          <p className="mt-4 whitespace-pre-line text-muted-foreground">
            {farm.story}
          </p>
        </div>
      )}

      {farm.description && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">About This Farm</h2>
          <p className="mt-3 text-muted-foreground">{farm.description}</p>
        </div>
      )}

      {farm.farming_method && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Farming Method</h2>
          <p className="mt-3 text-muted-foreground">{farm.farming_method}</p>
        </div>
      )}

      {/* Farm Products */}
      {products.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Available Products</h2>
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}