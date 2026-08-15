import type { Metadata } from 'next';
import { BatchCreatePage } from '../BatchCreatePage';

export const metadata: Metadata = {
  title: 'Create Batch',
  description: 'Create a new harvest batch.',
};

export default function CreateBatchPage() {
  return <BatchCreatePage />;
}
