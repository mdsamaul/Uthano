import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categoryService } from '@/services';
import { CategoryDetailClient } from './CategoryDetailClient';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await categoryService.getCategory(slug);
    return {
      title: category.name,
      description: category.description || `Shop ${category.name} products`,
    };
  } catch {
    return { title: 'Category Not Found' };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  let category;
  try {
    category = await categoryService.getCategory(slug);
  } catch {
    notFound();
  }
  return <CategoryDetailClient category={category} />;
}