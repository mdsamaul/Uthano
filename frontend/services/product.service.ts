import { apiGet } from '@/lib/api/client';
import { PaginatedData, Product, ProductQuery } from '@/types';
import { buildQueryString } from '@/lib/utils';

export const productService = {
  async getProducts(query: ProductQuery = {}): Promise<PaginatedData<Product>> {
    const queryString = buildQueryString({
      page: query.page,
      per_page: query.per_page,
      category: query.category,
      search: query.search,
      min_price: query.min_price,
      max_price: query.max_price,
      rating: query.rating,
      seasonal: query.seasonal,
      featured: query.featured,
      sort: query.sort,
    });
    return apiGet<PaginatedData<Product>>(`/products${queryString}`);
  },

  async getProduct(slug: string): Promise<Product> {
    return apiGet<Product>(`/products/${slug}`);
  },

  async getFeaturedProducts(): Promise<Product[]> {
    return apiGet<Product[]>('/products/featured');
  },

  async getSeasonalProducts(): Promise<Product[]> {
    return apiGet<Product[]>('/products/seasonal');
  },

  async getFreshToday(): Promise<Product[]> {
    return apiGet<Product[]>('/products/fresh-today');
  },

  async getPopularProducts(): Promise<Product[]> {
    return apiGet<Product[]>('/products/popular');
  },

  async searchProducts(query: string): Promise<Product[]> {
    return apiGet<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
  },

  async getRelatedProducts(productId: number): Promise<Product[]> {
    return apiGet<Product[]>(`/products/${productId}/related`);
  },
};