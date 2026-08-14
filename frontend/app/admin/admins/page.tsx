import type { Metadata } from 'next';
import { AdminsClient } from './AdminsClient';

export const metadata: Metadata = {
  title: 'Admins',
  description: 'Manage admin users, roles and permissions.',
};

export default function AdminsPage() {
  return <AdminsClient />;
}