import type { Metadata } from 'next';
import { ProductsClient } from './ProductsClient';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Manage UTHANO products.',
};

export default function AdminProductsPage() {
  return <ProductsClient />;
}
