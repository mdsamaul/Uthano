import type { Metadata } from 'next';
import { DeliveryDashboard } from '../DeliveryDashboard';

export const metadata: Metadata = { title: 'My Deliveries', description: 'View your assigned deliveries.' };

export default function DeliveryDeliveriesPage() {
  return <DeliveryDashboard />;
}
