import type { Metadata } from 'next';
import { FarmerHarvestsClient } from './FarmerHarvestsClient';

export const metadata: Metadata = { title: 'My Harvests', description: 'Your harvests.' };

export default function FarmerHarvestsPage() {
  return <FarmerHarvestsClient />;
}
