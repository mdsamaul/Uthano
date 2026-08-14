'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { PermissionChecklist } from '@/components/admin/PermissionChecklist';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { useAccess } from '@/hooks/use-access';
import { Role } from '@/types';

export function RolesClient() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasPermission } = useAccess();
  const canManage = hasPermission('role.manage') || hasPermission('permission.manage');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminService.getRoles(),
  });

  const roles = rolesQuery.data ?? [];

  const catalogQuery = useQuery({
    queryKey: ['admin', 'access', 'catalog'],
    queryFn: () => adminService.getAccessCatalog(),
    enabled: modalOpen,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; description?: string; permissions?: number[] }) =>
      adminService.createRole(data),
    onSuccess: () => { showToast('Role created successfully.'); setModalOpen(false); invalidate(); },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to create role.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; slug?: string; description?: string; permissions?: number[] } }) =>
      adminService.updateRole(id, data),
    onSuccess: () => { showToast('Role updated successfully.'); setModalOpen(false); invalidate(); },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to update role.', 'error'),
  });

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
            <Button variant="outline" size="sm" onClick={() => { setEditingRole(r); setModalOpen(true); }}>
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Roles</h1>
        {canManage && (
          <Button onClick={() => { setEditingRole(null); setModalOpen(true); }}>Create Role</Button>
        )}
      </div>

      <Card className="p-4">
        {rolesQuery.isError ? (
          <ErrorMessage message="Roles could not be loaded." onRetry={() => rolesQuery.refetch()} />
        ) : (
          <AdminTable columns={columns} data={roles} isLoading={rolesQuery.isLoading} emptyMessage="No roles found" />
        )}
      </Card>

      <RoleFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingRole={editingRole}
        catalog={catalogQuery.data ?? { roles: [], permissions: {} }}
        catalogLoading={catalogQuery.isLoading}
        submitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={(data) => {
          if (editingRole) {
            updateMutation.mutate({ id: editingRole.id, data });
          } else {
            createMutation.mutate(data as { name: string; slug: string; description?: string; permissions?: number[] });
          }
        }}
      />

      <ConfirmDialog
        open={!!deletingRole}
        onClose={() => setDeletingRole(null)}
        onConfirm={() => deletingRole && deleteMutation.mutate(deletingRole.id)}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${deletingRole?.name}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

function RoleFormModal({
  open,
  onClose,
  editingRole,
  catalog,
  catalogLoading,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  editingRole: Role | null;
  catalog: { roles: Role[]; permissions: Record<string, { id: number; name: string; slug: string; group: string }[]> };
  catalogLoading: boolean;
  submitting: boolean;
  onSubmit: (data: { name: string; slug: string; description?: string; permissions?: number[] }) => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [permissionIds, setPermissionIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadedId, setLoadedId] = useState<number | null>(null);

  const slugToId: Record<string, number> = {};
  Object.values(catalog.permissions).flat().forEach((p) => { slugToId[p.slug] = p.id; });

  if (open && editingRole && editingRole.id !== loadedId) {
    setName(editingRole.name);
    setSlug(editingRole.slug);
    setDescription(editingRole.description ?? '');
    setPermissionIds(
      (editingRole.permissions ?? [])
        .map((s) => slugToId[s])
        .filter((id): id is number => typeof id === 'number')
    );
    setLoadedId(editingRole.id);
  }
  if (open && !editingRole && loadedId !== 0) {
    setName('');
    setSlug('');
    setDescription('');
    setPermissionIds([]);
    setLoadedId(0);
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!/^[a-z0-9_]+$/.test(slug.trim())) next.slug = 'Slug must be lowercase letters, numbers or underscores';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim(), slug: slug.trim(), description: description.trim() || undefined, permissions: permissionIds });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingRole ? 'Edit Role' : 'Create Role'}
      description="Define a role and choose which permissions it grants."
      className="max-w-2xl"
    >
      {catalogLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading permissions...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Role Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Product Manager" error={errors.name} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="product_manager" error={errors.slug} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Permissions</p>
            <PermissionChecklist groups={catalog.permissions} selected={permissionIds} onChange={setPermissionIds} />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>
              {submitting ? 'Saving...' : editingRole ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}