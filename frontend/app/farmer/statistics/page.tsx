import type { Metadata } from 'next';
import { FarmerStatisticsClient } from './FarmerStatisticsClient';

export const metadata: Metadata = { title: 'Statistics', description: 'Your farming statistics.' };

export default function FarmerStatisticsPage() {
  return <FarmerStatisticsClient />;
}
