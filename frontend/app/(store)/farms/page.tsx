import type { Metadata } from 'next';
import { FarmsClient } from './FarmsClient';

export const metadata: Metadata = {
  title: 'Our Farms',
  description: 'Meet the farms behind UTHANO products.',
};

export default function FarmsPage() {
  return <FarmsClient />;
}