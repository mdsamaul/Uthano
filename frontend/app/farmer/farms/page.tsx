import type { Metadata } from 'next';
import { FarmerFarmsClient } from './FarmerFarmsClient';

export const metadata: Metadata = { title: 'My Farms', description: 'Your farms.' };

export default function FarmerFarmsPage() {
  return <FarmerFarmsClient />;
}
