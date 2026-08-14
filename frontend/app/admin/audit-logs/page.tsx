import type { Metadata } from 'next';
import { AuditLogsClient } from './AuditLogsClient';

export const metadata: Metadata = {
  title: 'Audit Logs',
  description: 'View the audit trail of system actions.',
};

export default function AuditLogsPage() {
  return <AuditLogsClient />;
}