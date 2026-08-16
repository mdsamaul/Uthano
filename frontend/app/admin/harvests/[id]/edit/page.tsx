import type { Metadata } from 'next';
import { HarvestFormClient } from '../../HarvestFormClient';

export const metadata: Metadata = {
  title: 'Edit Harvest',
  description: 'Update harvest details.',
};

interface EditHarvestPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHarvestPage({ params }: EditHarvestPageProps) {
  const { id } = await params;
  return <HarvestFormClient harvestId={id} />;
}
