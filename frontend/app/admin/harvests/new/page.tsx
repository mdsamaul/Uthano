import type { Metadata } from 'next';
import { HarvestFormClient } from '../HarvestFormClient';

export const metadata: Metadata = {
  title: 'Add Harvest',
  description: 'Record a new harvest.',
};

export default function NewHarvestPage() {
  return <HarvestFormClient />;
}
