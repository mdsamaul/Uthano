import type { Metadata } from 'next';
import { FarmerFormClient } from '../FarmerFormClient';

export const metadata: Metadata = {
  title: 'Add Farmer',
  description: 'Create a new farmer.',
};

export const dynamic = 'force-dynamic';

export default function NewFarmerPage() {
  return <FarmerFormClient />;
}
