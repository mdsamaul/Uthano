import type { Metadata } from 'next';
import { FarmFormClient } from '../FarmFormClient';

export const metadata: Metadata = {
  title: 'Add Farm',
  description: 'Create a new farm.',
};

export default function NewFarmPage() {
  return <FarmFormClient />;
}