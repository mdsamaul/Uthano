import type { Metadata } from 'next';
import { ProductFormClient } from '../../ProductFormClient';

export const metadata: Metadata = {
  title: 'Edit Product',
  description: 'Update product details.',
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  return <ProductFormClient productId={id} />;
}