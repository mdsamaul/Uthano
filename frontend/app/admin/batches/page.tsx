import type { Metadata } from 'next';
import { BatchesClient } from './BatchesClient';

export const metadata: Metadata = { title: 'Batches', description: 'Manage harvest batches.' };

export default function AdminBatchesPage() {
  return <BatchesClient />;
}
