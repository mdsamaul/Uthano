import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productService } from '@/services';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productService.getProduct(slug);
    return {
      title: product.name,
      description: product.short_description || product.description,
      openGraph: {
        title: product.name,
        description: product.short_description || product.description,
        images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
      },
    };
  } catch {
    return {
      title: 'Product Not Found',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product;

  try {
    product = await productService.getProduct(slug);
  } catch {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}