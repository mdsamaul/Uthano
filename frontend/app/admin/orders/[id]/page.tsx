import type { Metadata } from 'next';
import { OrderDetailClient } from './OrderDetailClient';

export const metadata: Metadata = {
  title: 'Order Details',
  description: 'View and manage a single order.',
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return <OrderDetailClient orderId={id} />;
}