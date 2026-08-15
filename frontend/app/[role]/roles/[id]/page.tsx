import type { Metadata } from 'next';
import { RolePermissionsPage } from '@/app/admin/roles/[id]/RolePermissionsPage';

type Props = {
  params: Promise<{ role: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Role Permissions - ${id}`,
    description: 'Manage role permissions.',
  };
}

export default function RolePermissionsRoot({ params }: Props) {
  return <RolePermissionsPage params={params} />;
}
