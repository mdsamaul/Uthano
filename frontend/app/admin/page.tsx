import type { Metadata } from 'next';
import { AdminDashboard } from './AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'UTHANO Admin Dashboard',
};
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return <AdminDashboard />;
}
