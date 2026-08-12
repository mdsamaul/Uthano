import type { Metadata } from 'next';
import { OrderSuccessClient } from './OrderSuccessClient';

export const metadata: Metadata = {
  title: 'Order Placed Successfully',
  description: 'Your order has been placed successfully.',
};

export default function OrderSuccessPage() {
  return <OrderSuccessClient />;
}