import type { Metadata } from 'next';
import { FarmerFormClient } from '../../FarmerFormClient';

export const metadata: Metadata = {
  title: 'Edit Farmer',
  description: 'Update farmer details.',
};

interface EditFarmerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFarmerPage({ params }: EditFarmerPageProps) {
  const { id } = await params;

  return <FarmerFormClient farmerId={id} />;
}