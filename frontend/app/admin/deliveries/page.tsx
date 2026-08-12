import type { Metadata } from 'next';
import { DeliveriesClient } from './DeliveriesClient';

export const metadata: Metadata = { title: 'Deliveries', description: 'Manage deliveries.' };

export default function AdminDeliveriesPage() {
  return <DeliveriesClient />;
}
