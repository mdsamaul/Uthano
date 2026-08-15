import type { Metadata } from 'next';
import { ProductsClient } from './ProductsClient';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Manage UTHANO products.',
};
export const dynamic = 'force-dynamic';

export default function AdminProductsPage() {
  return <ProductsClient />;
}
