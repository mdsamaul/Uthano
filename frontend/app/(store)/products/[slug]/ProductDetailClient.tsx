'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Minus, Plus, ShieldCheck, Truck, Sprout } from 'lucide-react';
import { Product } from '@/types';
import { formatBDT, formatDate, STOCK_STATUS_LABELS, getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { useCartStore } from '@/store';
import { TraceabilityTimeline, TRACEABILITY_ICONS } from '@/components/traceability/TraceabilityTimeline';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(product.min_order_qty || 1);
  const [activeImage, setActiveImage] = useState(0);

  const hasDiscount =
    product.discount_price && product.discount_price < product.price;
  const displayPrice = product.discount_price || product.price;
  const images = product.images?.length ? product.images : [];

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push('/checkout');
  };

  const traceabilitySteps = [
    {
      icon: TRACEABILITY_ICONS.farm,
      title: product.farm?.name || 'UTHANO Partner Farm',
      description: product.source_district
        ? `${product.source_district}${product.farm?.upazila ? `, ${product.farm.upazila}` : ''}`
        : undefined,
      status: 'completed' as const,
    },
    {
      icon: TRACEABILITY_ICONS.harvest,
      title: 'Harvested',
      description: product.harvest_date
        ? formatDate(product.harvest_date)
        : 'Recently harvested',
      status: 'completed' as const,
    },
    {
      icon: TRACEABILITY_ICONS.batch,
      title: 'Batch',
      description: 'Quality batch verified',
      status: 'completed' as const,
    },
    {
      icon: TRACEABILITY_ICONS.quality,
      title: 'Quality Checked',
      description: product.quality_grade
        ? `Grade: ${product.quality_grade}`
        : 'Passed quality inspection',
      status: 'completed' as const,
    },
    {
      icon: TRACEABILITY_ICONS.uthano,
      title: 'UTHANO',
      description: 'Handled with care',
      status: 'completed' as const,
    },
    {
      icon: TRACEABILITY_ICONS.delivery,
      title: 'Delivered to You',
      status: 'current' as const,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
            {images[activeImage]?.url ? (
              <Image
                src={getImageUrl(images[activeImage].url)}
                alt={images[activeImage].alt || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
            {hasDiscount && (
              <Badge className="absolute left-3 top-3 bg-red-100 text-red-800">
                {Math.round(((product.price - displayPrice) / product.price) * 100)}% OFF
              </Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setActiveImage(index)}
                  className={`relative h-20 w-20 overflow-hidden rounded-md border-2 ${
                    index === activeImage
                      ? 'border-primary'
                      : 'border-border'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={getImageUrl(image.url)}
                    alt={image.alt || product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2">
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            {product.is_seasonal && (
              <Badge className="bg-secondary text-white">Seasonal</Badge>
            )}
          </div>

          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>

          {product.source_district && (
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              From {product.source_district}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating || 0}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.review_count || 0} reviews)
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatBDT(displayPrice)}</span>
            <span className="text-muted-foreground">/ {product.unit}</span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {formatBDT(product.price)}
              </span>
            )}
          </div>

          <div className="mt-3">
            <Badge
              variant={
                product.stock_status === 'in_stock'
                  ? 'success'
                  : product.stock_status === 'low_stock'
                    ? 'warning'
                    : 'danger'
              }
            >
              {STOCK_STATUS_LABELS[product.stock_status]}
            </Badge>
          </div>

          {/* Quantity & Actions */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center rounded-md border border-border">
                <button
                  onClick={() => setQuantity(Math.max(product.min_order_qty || 1, quantity - 1))}
                  className="p-2 hover:bg-muted"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(product.max_order_qty || 100, quantity + 1)
                    )
                  }
                  className="p-2 hover:bg-muted"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">{product.unit}</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <AddToCartButton
                product={product}
                quantity={quantity}
                size="lg"
                className="flex-1"
                disabled={product.stock_status === 'out_of_stock'}
              />
              <Button
                size="lg"
                variant="secondary"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={product.stock_status === 'out_of_stock'}
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6">
            <div className="flex flex-col items-center text-center">
              <Sprout className="h-6 w-6 text-primary" />
              <p className="mt-1 text-xs font-medium">Farm Sourced</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <p className="mt-1 text-xs font-medium">Quality Checked</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Truck className="h-6 w-6 text-primary" />
              <p className="mt-1 text-xs font-medium">Fresh Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold">Product Description</h2>
          <p className="mt-4 whitespace-pre-line text-muted-foreground">
            {product.description}
          </p>

          {product.short_description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Quick Overview</h3>
              <p className="mt-2 text-muted-foreground">{product.short_description}</p>
            </div>
          )}

          {/* Product info */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold">Product Information</h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <dt className="text-xs text-muted-foreground">SKU</dt>
                <dd className="mt-1 text-sm font-medium">{product.sku}</dd>
              </div>
              <div className="rounded-lg border border-border p-3">
                <dt className="text-xs text-muted-foreground">Unit</dt>
                <dd className="mt-1 text-sm font-medium">{product.unit}</dd>
              </div>
              <div className="rounded-lg border border-border p-3">
                <dt className="text-xs text-muted-foreground">Minimum Order</dt>
                <dd className="mt-1 text-sm font-medium">
                  {product.min_order_qty} {product.unit}
                </dd>
              </div>
              <div className="rounded-lg border border-border p-3">
                <dt className="text-xs text-muted-foreground">Maximum Order</dt>
                <dd className="mt-1 text-sm font-medium">
                  {product.max_order_qty} {product.unit}
                </dd>
              </div>
              {product.quality_grade && (
                <div className="rounded-lg border border-border p-3">
                  <dt className="text-xs text-muted-foreground">Quality Grade</dt>
                  <dd className="mt-1 text-sm font-medium">{product.quality_grade}</dd>
                </div>
              )}
              {product.harvest_date && (
                <div className="rounded-lg border border-border p-3">
                  <dt className="text-xs text-muted-foreground">Harvest Date</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {formatDate(product.harvest_date)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Traceability */}
        <div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-bold">Farm-to-Home Traceability</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Know exactly where your food comes from
            </p>
            <div className="mt-6">
              <TraceabilityTimeline steps={traceabilitySteps} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}