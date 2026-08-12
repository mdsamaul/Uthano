'use client';

import { useQuery } from '@tanstack/react-query';
import { categoryService, productService, farmService } from '@/services';
import {
  TrustSection,
  CategoriesSection,
  ProductSection,
  FarmToHomeStory,
  HowItWorks,
  FeaturedFarms,
  CustomerReviews,
  DeliveryInfo,
  Newsletter,
} from './HomeSections';

export function HomeContent() {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const freshTodayQuery = useQuery({
    queryKey: ['products', 'fresh-today'],
    queryFn: () => productService.getFreshToday(),
    staleTime: 5 * 60 * 1000,
  });

  const seasonalQuery = useQuery({
    queryKey: ['products', 'seasonal'],
    queryFn: () => productService.getSeasonalProducts(),
    staleTime: 5 * 60 * 1000,
  });

  const popularQuery = useQuery({
    queryKey: ['products', 'popular'],
    queryFn: () => productService.getPopularProducts(),
    staleTime: 5 * 60 * 1000,
  });

  const farmsQuery = useQuery({
    queryKey: ['farms', 'featured'],
    queryFn: () => farmService.getFeaturedFarms(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <TrustSection />
      <CategoriesSection
        categories={categoriesQuery.data || []}
        isLoading={categoriesQuery.isLoading}
      />
      <ProductSection
        title="Fresh Today"
        subtitle="Harvested and delivered fresh"
        products={freshTodayQuery.data || []}
        isLoading={freshTodayQuery.isLoading}
        viewAllHref="/products?sort=newest"
      />
      <ProductSection
        title="Seasonal Fruits"
        subtitle="In season right now"
        products={seasonalQuery.data || []}
        isLoading={seasonalQuery.isLoading}
        viewAllHref="/products?seasonal=true"
      />
      <ProductSection
        title="Popular Products"
        subtitle="Loved by families across Bangladesh"
        products={popularQuery.data || []}
        isLoading={popularQuery.isLoading}
        viewAllHref="/products?sort=popular"
      />
      <FarmToHomeStory />
      <HowItWorks />
      <FeaturedFarms
        farms={farmsQuery.data || []}
        isLoading={farmsQuery.isLoading}
      />
      <CustomerReviews />
      <DeliveryInfo />
      <Newsletter />
    </>
  );
}