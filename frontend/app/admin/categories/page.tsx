import type { Metadata } from 'next';
import { CategoriesClient } from './CategoriesClient';

export const metadata: Metadata = {
  title: 'Categories - Admin',
  description: 'Manage product categories',
};
export const dynamic = 'force-dynamic';

export default function CategoriesPage() {
  return <CategoriesClient />;
}