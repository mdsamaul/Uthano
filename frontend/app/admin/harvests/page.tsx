import type { Metadata } from 'next';
import { HarvestsClient } from './HarvestsClient';

export const metadata: Metadata = { title: 'Harvests', description: 'Manage harvests.' };
export const dynamic = 'force-dynamic';

export default function AdminHarvestsPage() {
  return <HarvestsClient />;
}
