import type { Metadata } from 'next';
import { RoleCreatePage } from '../RoleCreatePage';

export const metadata: Metadata = {
  title: 'Create Role',
  description: 'Create a new role and assign permissions.',
};

export default function CreateRolePage() {
  return <RoleCreatePage />;
}
