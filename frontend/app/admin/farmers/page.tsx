import type { Metadata } from 'next';
import { FarmersClient } from './FarmersClient';

export const metadata: Metadata = { title: 'Farmers', description: 'Manage UTHANO farmers.' };
export const dynamic = 'force-dynamic';

export default function AdminFarmersPage() {
  return <FarmersClient />;
}
