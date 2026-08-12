import type { Metadata } from 'next';
import { ReviewsClient } from './ReviewsClient';

export const metadata: Metadata = {
  title: 'My Reviews',
  description: 'Manage your product reviews.',
};

export default function ReviewsPage() {
  return <ReviewsClient />;
}