import type { Metadata } from 'next';
import { CustomersClient } from './CustomersClient';

export const metadata: Metadata = { title: 'Customers', description: 'Manage UTHANO customers.' };

export default function AdminCustomersPage() {
  return <CustomersClient />;
}
