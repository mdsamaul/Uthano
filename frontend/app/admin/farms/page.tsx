import type { Metadata } from 'next';
import { FarmsClient } from './FarmsClient';

export const metadata: Metadata = { title: 'Farms', description: 'Manage UTHANO farms.' };
export const dynamic = 'force-dynamic';

export default function AdminFarmsPage() {
  return <FarmsClient />;
}
