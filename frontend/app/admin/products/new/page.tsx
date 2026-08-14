import type { Metadata } from 'next';
import { ProductFormClient } from '../ProductFormClient';

export const metadata: Metadata = {
  title: 'Add Product',
  description: 'Create a new product in the catalog.',
};

export default function NewProductPage() {
  return <ProductFormClient />;
}