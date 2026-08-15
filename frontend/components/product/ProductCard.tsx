import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import { Product } from '@/types';
import { formatBDT, STOCK_STATUS_LABELS, getImageUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from './AddToCartButton';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const hasDiscount =
    product.discount_price && product.discount_price < product.price;
  const primaryImage = getImageUrl(product.images?.find((img) => img.is_primary)?.url);
  const displayPrice = product.discount_price || product.price;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-card-hover">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-muted-foreground">No image</span>
          </div>
        )}

        {hasDiscount && (
          <Badge className="absolute left-2 top-2 bg-red-100 text-red-800">
            {Math.round(((product.price - displayPrice) / product.price) * 100)}% OFF
          </Badge>
        )}
        {product.is_seasonal && (
          <Badge className="absolute right-2 top-2 bg-secondary text-white">
            Seasonal
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary"
        >
          {product.name}
        </Link>

        {product.source_district && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            From {product.source_district}
            {product.farm?.name ? ` · ${product.farm.name}` : ''}
          </p>
        )}

        <div className="mt-2 flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{product.rating || 0}</span>
          <span className="text-xs text-muted-foreground">
            ({product.review_count || 0})
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatBDT(displayPrice)}
          </span>
          <span className="text-xs text-muted-foreground">/ {product.unit}</span>
        </div>

        {hasDiscount && (
          <p className="text-xs text-muted-foreground line-through">
            {formatBDT(product.price)}
          </p>
        )}

        <div className="mt-2">
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

        <div className="mt-3">
          <AddToCartButton
            product={product}
            size="sm"
            className="w-full"
            disabled={product.stock_status === 'out_of_stock'}
          />
        </div>
      </div>
    </div>
  );
}