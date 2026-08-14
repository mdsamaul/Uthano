import type { Metadata } from 'next';
import { CouponsClient } from './CouponsClient';

export const metadata: Metadata = {
  title: 'Coupons',
  description: 'Manage promotional coupons and discounts.',
};

export default function CouponsPage() {
  return <CouponsClient />;
}