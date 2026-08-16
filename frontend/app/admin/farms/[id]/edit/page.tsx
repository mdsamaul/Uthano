import type { Metadata } from 'next';
import { FarmFormClient } from '../../FarmFormClient';

export const metadata: Metadata = {
  title: 'Edit Farm',
  description: 'Update farm details.',
};

interface EditFarmPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFarmPage({ params }: EditFarmPageProps) {
  const { id } = await params;

  return <FarmFormClient farmId={id} />;
}