import type { Metadata } from 'next';
import { CompletedDeliveriesClient } from './CompletedDeliveriesClient';

export const metadata: Metadata = { title: 'Completed Deliveries', description: 'View your completed deliveries.' };

export default function DeliveryCompletedPage() {
  return <CompletedDeliveriesClient />;
}
