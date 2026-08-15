'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { useAccess } from '@/hooks/use-access';
import { Role } from '@/types';

export function RolesListClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasPermission } = useAccess();
  const canManage = hasPermission('role.manage') || hasPermission('permission.manage');

  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  // Get current role from URL (superadmin, admin, etc.)
  const currentRole = window.location.pathname.split('/')[1] || 'admin';

  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminService.getRoles(),
  });

  const roles = rolesQuery.data ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteRole(id),
    onSuccess: () => { showToast('Role deleted successfully.'); setDeletingRole(null); invalidate(); },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to delete role.', 'error'),
  });

  const columns = [
    { key: 'name', header: 'Role Name' },
    { key: 'slug', header: 'Slug' },
    { key: 'description', header: 'Description', render: (r: Role) => r.description || '—' },
    { key: 'users_count', header: 'Users', render: (r: Role) => r.users_count ?? 0 },
    { key: 'permissions', header: 'Permissions', render: (r: Role) => `${r.permissions?.length ?? 0} assigned` },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: Role) => (
        <div className="flex flex-wrap items-center gap-2">
          {canManage && (
            <Button variant="outline" size="sm" onClick={() => router.push(`/${currentRole}/roles/${r.id}`)}>
              Edit
            </Button>
          )}
          {canManage && r.slug !== 'superadmin' && (
            <Button variant="danger" size="sm" onClick={() => setDeletingRole(r)}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roles</h1>
        {canManage && (
          <Button onClick={() => router.push(`/${currentRole}/roles/create`)}>
            Create Role
          </Button>
        )}
      </div>

      {rolesQuery.isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading roles...</p>
      ) : rolesQuery.isError ? (
        <ErrorMessage message={rolesQuery.error instanceof Error ? rolesQuery.error.message : 'Failed to load roles.'} />
      ) : (
        <AdminTable columns={columns} data={roles} />
      )}

      {deletingRole && (
        <ConfirmDialog
          open={!!deletingRole}
          onClose={() => setDeletingRole(null)}
          onConfirm={() => deleteMutation.mutate(deletingRole.id)}
          title="Delete Role"
          description={`Are you sure you want to delete the role "${deletingRole.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      )}
    </div>
  );
}
