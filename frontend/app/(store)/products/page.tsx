import type { Metadata } from 'next';
import { ProductsClient } from './ProductsClient';

export const metadata: Metadata = {
  title: 'Shop Fresh Products',
  description:
    'Browse fresh fruits and agricultural products sourced directly from Bangladeshi farms. From Farm to Family.',
};

export default function ProductsPage() {
  return <ProductsClient />;
}