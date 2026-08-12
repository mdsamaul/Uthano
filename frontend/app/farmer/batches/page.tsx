import type { Metadata } from 'next';
import { FarmerBatchesClient } from './FarmerBatchesClient';

export const metadata: Metadata = { title: 'My Batches', description: 'Your harvest batches.' };

export default function FarmerBatchesPage() {
  return <FarmerBatchesClient />;
}
