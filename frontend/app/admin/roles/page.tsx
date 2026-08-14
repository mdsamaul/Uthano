import type { Metadata } from 'next';
import { RolesClient } from './RolesClient';

export const metadata: Metadata = {
  title: 'Roles',
  description: 'Manage roles and role permissions.',
};

export default function RolesPage() {
  return <RolesClient />;
}