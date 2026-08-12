import type { Metadata } from 'next';
import { FarmerDashboard } from './FarmerDashboard';

export const metadata: Metadata = { title: 'Farmer Dashboard', description: 'Your farm dashboard.' };

export default function FarmerPage() {
  return <FarmerDashboard />;
}
