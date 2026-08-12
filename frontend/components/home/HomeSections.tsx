import Link from 'next/link';
import Image from 'next/image';
import {
  Sprout,
  ShieldCheck,
  Truck,
  Leaf,
  MapPin,
  Star,
  ArrowRight,
  Package,
  Home,
  Wheat,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Product, Farm } from '@/types';

// ============================================
// Trust Section
// ============================================

const TRUST_ITEMS = [
  { icon: Sprout, title: 'Farm Sourced', description: 'Directly from local farms' },
  { icon: ShieldCheck, title: 'Quality Checked', description: 'Every batch verified' },
  { icon: Truck, title: 'Fresh Delivery', description: 'Fast home delivery' },
  { icon: Leaf, title: 'Transparent Sourcing', description: 'Know your farm' },
];

export function TrustSection() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// Categories Section
// ============================================

interface CategoriesSectionProps {
  categories: { id: number; name: string; slug: string; image?: string; product_count?: number }[];
  isLoading?: boolean;
}

export function CategoriesSection({ categories, isLoading }: CategoriesSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shop by Category</h2>
        <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
          View All
        </Link>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center rounded-lg border border-border bg-card p-4 text-center transition-shadow hover:shadow-card-hover"
            >
              <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary-light">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Leaf className="h-8 w-8 text-primary" />
                )}
              </div>
              <p className="text-sm font-medium line-clamp-1">{category.name}</p>
              {category.product_count !== undefined && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {category.product_count} products
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================
// Product Section (Fresh Today / Seasonal / Popular)
// ============================================

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  isLoading?: boolean;
  viewAllHref?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  isLoading,
  viewAllHref = '/products',
}: ProductSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline">
          View All
        </Link>
      </div>
      <ProductGrid products={products} isLoading={isLoading} skeletonCount={4} />
    </section>
  );
}

// ============================================
// Farm-to-Home Story
// ============================================

export function FarmToHomeStory() {
  return (
    <section className="bg-primary-light/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">From Farm to Home</h2>
            <p className="mt-4 text-muted-foreground">
              UTHANO connects you directly with Bangladeshi farmers. We track
              every product from the farm through harvest, quality checks, and
              delivery to your doorstep.
            </p>
            <div className="mt-6 space-y-4">
              {[
                { icon: Sprout, text: 'Sourced from trusted local farms' },
                { icon: ShieldCheck, text: 'Quality checked at every step' },
                { icon: Truck, text: 'Delivered fresh to your home' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium">{item.text}</p>
                </div>
              ))}
            </div>
            <Link href="/about" className="mt-8 inline-block">
              <Button variant="outline">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="rounded-2xl bg-card p-8 shadow-card">
            <h3 className="text-lg font-semibold">Know Your Farm</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Every UTHANO product has a complete traceability story. See where
              your food comes from, who grew it, and when it was harvested.
            </p>
            <div className="mt-6 space-y-4">
              {[
                { icon: Sprout, label: 'Farm', value: 'Rahim Agro Farm, Jhenaidah' },
                { icon: Wheat, label: 'Harvested', value: '10 August 2026' },
                { icon: Package, label: 'Batch', value: 'BATCH-JH-GUA-20260810-0001' },
                { icon: Home, label: 'Delivered', value: 'To your home' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// How UTHANO Works
// ============================================

const HOW_IT_WORKS = [
  { step: '01', title: 'Browse Fresh Products', description: 'Explore fruits and products sourced directly from farms' },
  { step: '02', title: 'Place Your Order', description: 'Add to cart and checkout with cash on delivery' },
  { step: '03', title: 'We Source & Pack', description: 'We harvest, quality check, and pack your order' },
  { step: '04', title: 'Delivered to You', description: 'Fresh products delivered to your doorstep' },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold">How UTHANO Works</h2>
        <p className="mt-2 text-muted-foreground">
          From farm to your family in four simple steps
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {HOW_IT_WORKS.map((item) => (
          <Card key={item.step} className="p-6">
            <span className="text-3xl font-bold text-primary/20">{item.step}</span>
            <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ============================================
// Featured Farms
// ============================================

interface FeaturedFarmsProps {
  farms: Farm[];
  isLoading?: boolean;
}

export function FeaturedFarms({ farms, isLoading }: FeaturedFarmsProps) {
  return (
    <section className="bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">Featured Farms</h2>
            <p className="mt-2 text-muted-foreground">Meet the farmers behind your food</p>
          </div>
          <Link href="/farms" className="text-sm font-medium text-primary hover:underline">
            View All Farms
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {farms.map((farm) => (
              <Link
                key={farm.id}
                href={`/farms/${farm.slug}`}
                className="group rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                    <Sprout className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary">{farm.name}</h3>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {farm.district}
                    </p>
                  </div>
                </div>
                {farm.description && (
                  <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                    {farm.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================
// Customer Reviews
// ============================================

const REVIEWS = [
  {
    name: 'Rahima Begum',
    location: 'Dhaka',
    rating: 5,
    text: 'The guava was so fresh! You can really taste the difference when it comes straight from the farm.',
  },
  {
    name: 'Mohammad Karim',
    location: 'Chattogram',
    rating: 5,
    text: 'I love being able to see exactly which farm my fruits come from. Very transparent and trustworthy.',
  },
  {
    name: 'Fatema Akter',
    location: 'Sylhet',
    rating: 4,
    text: 'Delivery was fast and the mangoes were perfectly ripe. Will definitely order again!',
  },
];

export function CustomerReviews() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold">What Our Customers Say</h2>
        <p className="mt-2 text-muted-foreground">Trusted by families across Bangladesh</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {REVIEWS.map((review) => (
          <Card key={review.name} className="p-6">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{review.text}</p>
            <div className="mt-4">
              <p className="text-sm font-semibold">{review.name}</p>
              <p className="text-xs text-muted-foreground">{review.location}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ============================================
// Delivery Info
// ============================================

export function DeliveryInfo() {
  return (
    <section className="bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 text-center sm:grid-cols-3">
          <div>
            <Truck className="mx-auto h-8 w-8" />
            <h3 className="mt-3 font-semibold">Fast Delivery</h3>
            <p className="mt-1 text-sm text-white/80">Same-day delivery in Dhaka</p>
          </div>
          <div>
            <ShieldCheck className="mx-auto h-8 w-8" />
            <h3 className="mt-3 font-semibold">Quality Guaranteed</h3>
            <p className="mt-1 text-sm text-white/80">Every batch quality checked</p>
          </div>
          <div>
            <Home className="mx-auto h-8 w-8" />
            <h3 className="mt-3 font-semibold">Cash on Delivery</h3>
            <p className="mt-1 text-sm text-white/80">Pay when you receive</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// Newsletter
// ============================================

export function Newsletter() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-muted p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold">Stay Fresh with UTHANO</h2>
        <p className="mt-2 text-muted-foreground">
          Get updates on seasonal fruits, new farms, and exclusive offers
        </p>
        <form
          className="mx-auto mt-6 flex max-w-md gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-md border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Email address"
          />
          <Button type="submit">Subscribe</Button>
        </form>
      </div>
    </section>
  );
}