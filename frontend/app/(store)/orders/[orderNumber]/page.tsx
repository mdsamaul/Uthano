import type { Metadata } from 'next';
import { OrderTrackingClient } from './OrderTrackingClient';

export const metadata: Metadata = {
  title: 'Track Order',
  description: 'Track your UTHANO order.',
};

export default function OrderTrackingPage() {
  return <OrderTrackingClient />;
}