import { apiGet } from '@/lib/api/client';
import { Category } from '@/types';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    return apiGet<Category[]>('/categories');
  },

  async getCategory(slug: string): Promise<Category> {
    return apiGet<Category>(`/categories/${slug}`);
  },
};