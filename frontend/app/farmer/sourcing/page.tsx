import type { Metadata } from 'next';
import { FarmerSourcingClient } from './FarmerSourcingClient';

export const metadata: Metadata = { title: 'My Supply Records', description: 'Your supply records.' };

export default function FarmerSourcingPage() {
  return <FarmerSourcingClient />;
}
