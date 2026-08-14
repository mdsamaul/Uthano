'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { PermissionChecklist } from '@/components/admin/PermissionChecklist';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import { Pagination } from '@/components/common/pagination';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { useAccess } from '@/hooks/use-access';
import { AccessCatalog, AdminUserFormValues, PaginationMeta, User } from '@/types';

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
  from: 0,
  to: 0,
};

export function AdminsClient() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasPermission } = useAccess();
  const canManage = hasPermission('user.manage');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [togglingUser, setTogglingUser] = useState<User | null>(null);

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', page, debouncedSearch, roleFilter],
    queryFn: () => adminService.getUsers(page, 20, debouncedSearch, roleFilter || undefined),
  });

  const catalogQuery = useQuery({
    queryKey: ['admin', 'access', 'catalog'],
    queryFn: () => adminService.getAccessCatalog(),
    enabled: modalOpen,
  });

  const catalog: AccessCatalog = catalogQuery.data ?? { roles: [], permissions: {} };
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const createMutation = useMutation({
    mutationFn: (data: AdminUserFormValues & { password: string }) => adminService.createUser(data),
    onSuccess: () => { showToast('Admin created successfully.'); setModalOpen(false); invalidate(); },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to create admin.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminUserFormValues & { password?: string } }) => (async () => {
      const { roles, permissions, password, ...basic } = data;
      await adminService.updateUser(id, { ...basic, ...(password ? { password } : {}) });
      await adminService.updateUserRoles(id, roles ?? []);
      await adminService.updateUserPermissions(id, permissions ?? []);
    })(),
    onSuccess: () => { showToast('Admin updated successfully.'); setModalOpen(false); invalidate(); },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to update admin.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => { showToast('Admin deleted successfully.'); setDeletingUser(null); invalidate(); },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to delete admin.', 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminService.toggleUserStatus(id),
    onSuccess: (user) => {
      showToast(user.is_active ? 'Admin activated successfully.' : 'Admin deactivated successfully.');
      setTogglingUser(null);
      invalidate();
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to update admin status.', 'error'),
  });

  const users = usersQuery.data?.items ?? [];
  const meta = usersQuery.data?.meta ?? EMPTY_META;
  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        render: (u: User) => (
          <div>
            <p className="font-medium">{u.name}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        ),
      },
      { key: 'phone', header: 'Phone', render: (u: User) => u.phone || '—' },
      {
        key: 'roles',
        header: 'Roles',
        render: (u: User) => (
          <div className="flex flex-wrap gap-1">
            {(u.roles ?? []).map((r) => (
              <span key={r} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                {r.replace(/_/g, ' ')}
              </span>
            ))}
            {u.is_superadmin && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Super Admin
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (u: User) => (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              u.is_active === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${u.is_active === false ? 'bg-red-500' : 'bg-green-500'}`} />
            {u.is_active === false ? 'Inactive' : 'Active'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (u: User) => (
          <div className="flex flex-wrap items-center gap-2">
            {canManage && (
              <Button variant="outline" size="sm" onClick={() => { setEditingUser(u); setModalOpen(true); }}>
                Edit
              </Button>
            )}
            {canManage && (
              <Button variant="outline" size="sm" onClick={() => setTogglingUser(u)}>
                {u.is_active === false ? 'Activate' : 'Deactivate'}
              </Button>
            )}
            {canManage && !u.is_superadmin && (
              <Button variant="danger" size="sm" onClick={() => setDeletingUser(u)}>
                Delete
              </Button>
            )}
          </div>
        ),
      },
    ],
    [canManage]
  );
return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Admins</h1>
        {canManage && (
          <Button onClick={() => { setEditingUser(null); setModalOpen(true); }}>
            Add Admin
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              const v = e.target.value;
              setTimeout(() => setDebouncedSearch(v), 400);
            }}
            className="sm:max-w-xs"
          />
          <Select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="sm:max-w-[180px]"
          >
            <option value="">All roles</option>
            {catalog.roles.map((r) => (
              <option key={r.id} value={r.slug}>{r.name}</option>
            ))}
          </Select>
        </div>

        {usersQuery.isError ? (
          <ErrorMessage message="Admins could not be loaded." onRetry={() => usersQuery.refetch()} />
        ) : (
          <>
            <AdminTable
              columns={columns}
              data={users}
              isLoading={usersQuery.isLoading}
              emptyMessage="No admins found"
            />
            {meta.total > 0 && <Pagination meta={meta} onPageChange={setPage} className="mt-4" />}
          </>
        )}
      </Card>

      <AdminFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingUser={editingUser}
        catalog={catalog}
        catalogLoading={catalogQuery.isLoading}
        submitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={(data) => {
          if (editingUser) {
            updateMutation.mutate({ id: editingUser.id, data });
          } else {
            createMutation.mutate(data as AdminUserFormValues & { password: string });
          }
        }}
      />

      <ConfirmDialog
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
        title="Delete Admin"
        description={`Are you sure you want to permanently delete "${deletingUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        open={!!togglingUser}
        onClose={() => setTogglingUser(null)}
        onConfirm={() => togglingUser && toggleMutation.mutate(togglingUser.id)}
        title={togglingUser?.is_active === false ? 'Activate Admin' : 'Deactivate Admin'}
        description={
          togglingUser?.is_active === false
            ? `Activate "${togglingUser?.name}"? They will regain access to their permitted modules.`
            : `Deactivate "${togglingUser?.name}"? They will immediately lose access to the admin panel.`
        }
        confirmText={togglingUser?.is_active === false ? 'Activate' : 'Deactivate'}
        variant={togglingUser?.is_active === false ? 'default' : 'danger'}
      />
    </div>
  );
}

function AdminFormModal({
  open,
  onClose,
  editingUser,
  catalog,
  catalogLoading,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  editingUser: User | null;
  catalog: AccessCatalog;
  catalogLoading: boolean;
  submitting: boolean;
  onSubmit: (data: AdminUserFormValues & { password?: string }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadedId, setLoadedId] = useState<number | null>(null);

  // The UserResource returns permission slugs; map them back to permission ids.
  const slugToId: Record<string, number> = {};
  Object.values(catalog.permissions).flat().forEach((p) => { slugToId[p.slug] = p.id; });

  // Sync local state when the modal opens for create or edit.
  // Wait for the access catalog so permission slugs can be mapped back to ids.
  if (open && !catalogLoading && editingUser && editingUser.id !== loadedId) {
    setName(editingUser.name);
    setEmail(editingUser.email ?? '');
    setPhone(editingUser.phone ?? '');
    setPassword('');
    setIsActive(editingUser.is_active !== false);
    setRoles(editingUser.roles ?? []);
    setPermissions(
      (editingUser.permissions ?? [])
        .map((s) => slugToId[s])
        .filter((id): id is number => typeof id === 'number')
    );
    setLoadedId(editingUser.id);
  }
  if (open && !catalogLoading && !editingUser && loadedId !== 0) {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setIsActive(true);
    setRoles(['admin']);
    setPermissions([]);
    setLoadedId(0);
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'A valid email is required';
    if (!editingUser && password.length < 8) next.password = 'Password must be at least 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      password: password || undefined,
      is_active: isActive,
      roles,
      permissions,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingUser ? 'Edit Admin' : 'Add Admin'}
      description={editingUser ? 'Update details, role and permissions.' : 'Create a new admin user.'}
      className="max-w-2xl"
    >
      {catalogLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading access catalog...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Admin name" error={errors.name} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@uthano.com" error={errors.email} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {editingUser ? 'New Password (optional)' : 'Password'}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingUser ? 'Leave blank to keep current' : 'Min 8 characters'}
                error={errors.password}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Role</label>
            <Select value={roles[0] ?? ''} onChange={(e) => setRoles(e.target.value ? [e.target.value] : [])}>
              <option value="">Select a role</option>
              {catalog.roles.map((r) => (
                <option key={r.id} value={r.slug}>{r.name}</option>
              ))}
            </Select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary"
            />
            <span className="text-sm">Active (can log in)</span>
          </label>

          <div>
            <p className="mb-2 text-sm font-medium">Direct Permissions</p>
            <PermissionChecklist groups={catalog.permissions} selected={permissions} onChange={setPermissions} />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>
              {submitting ? 'Saving...' : editingUser ? 'Save Changes' : 'Create Admin'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}