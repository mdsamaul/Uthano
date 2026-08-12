import type { Metadata } from 'next';
import { WishlistClient } from './WishlistClient';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: 'View your saved products.',
};

export default function WishlistPage() {
  return <WishlistClient />;
}