import type { Metadata } from 'next';
import { DeliveryDashboard } from './DeliveryDashboard';

export const metadata: Metadata = { title: 'Delivery Dashboard', description: 'Your delivery dashboard.' };

export default function DeliveryPage() {
  return <DeliveryDashboard />;
}
