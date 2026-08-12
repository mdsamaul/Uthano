import type { Metadata } from 'next';
import { InventoryClient } from './InventoryClient';

export const metadata: Metadata = { title: 'Inventory', description: 'Manage inventory.' };

export default function AdminInventoryPage() {
  return <InventoryClient />;
}
