import type { Metadata } from 'next';
import { RolesListClient } from './RolesListClient';

export const metadata: Metadata = {
  title: 'Roles',
  description: 'Manage roles and role permissions.',
};

export default function RolesPage() {
  return <RolesListClient />;
}