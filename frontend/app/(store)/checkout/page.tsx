import type { Metadata } from 'next';
import { CheckoutClient } from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order with UTHANO.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}