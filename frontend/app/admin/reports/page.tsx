import type { Metadata } from 'next';
import { ReportsClient } from './ReportsClient';

export const metadata: Metadata = { title: 'Reports', description: 'View reports.' };
export const dynamic = 'force-dynamic';

export default function AdminReportsPage() {
  return <ReportsClient />;
}
