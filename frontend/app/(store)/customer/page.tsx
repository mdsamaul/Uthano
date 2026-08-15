import type { Metadata } from 'next';
import { CustomerDashboard } from './CustomerDashboard';

export const metadata: Metadata = {
  title: 'My Dashboard',
  description: 'Your UTHANO customer dashboard.',
};
export const dynamic = 'force-dynamic';

export default function CustomerDashboardPage() {
  return <CustomerDashboard />;
}