import type { Metadata } from 'next';
import { QualityChecksClient } from './QualityChecksClient';

export const metadata: Metadata = { title: 'Quality Checks', description: 'Manage quality checks.' };

export default function AdminQualityChecksPage() {
  return <QualityChecksClient />;
}
