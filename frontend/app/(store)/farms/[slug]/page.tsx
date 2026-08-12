import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { farmService } from '@/services';
import { FarmDetailClient } from './FarmDetailClient';

interface FarmPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: FarmPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const farm = await farmService.getFarm(slug);
    return {
      title: farm.name,
      description: farm.description || `Farm from ${farm.district}`,
    };
  } catch {
    return { title: 'Farm Not Found' };
  }
}

export default async function FarmPage({ params }: FarmPageProps) {
  const { slug } = await params;
  let farm;
  try {
    farm = await farmService.getFarm(slug);
  } catch {
    notFound();
  }
  return <FarmDetailClient farm={farm} />;
}