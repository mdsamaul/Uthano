'use client';

import { useMemo, useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { PermissionChecklist } from '@/components/admin/PermissionChecklist';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/modal';
import { Pagination } from '@/components/common/pagination';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { useAccess } from '@/hooks/use-access';
import { AccessCatalog, AdminUserFormValues, PaginationMeta, User } from '@/types';
import { ArrowLeft, Pencil, Trash2, UserPlus, Ban, CheckCircle2 } from 'lucide-react';

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
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [togglingUser, setTogglingUser] = useState<User | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', page, debouncedSearch, roleFilter],
    queryFn: () => adminService.getUsers(page, 20, debouncedSearch, roleFilter || undefined),
  });

  const catalogQuery = useQuery({
    queryKey: ['admin', 'access', 'catalog'],
    queryFn: () => adminService.getAccessCatalog(),
    enabled: showForm,
  });

  const catalog: AccessCatalog = catalogQuery.data ?? { roles: [], permissions: {} };
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const createMutation = useMutation({
    mutationFn: (data: AdminUserFormValues & { password: string }) => adminService.createUser(data),
    onSuccess: () => { showToast('Admin created successfully.'); setShowForm(false); setEditingUser(null); invalidate(); },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to create admin.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminUserFormValues & { password?: string } }) => (async () => {
      const { roles, permissions, password, ...basic } = data;
      await adminService.updateUser(id, { ...basic, ...(password ? { password } : {}) });
      await adminService.updateUserRoles(id, roles ?? []);
      await adminService.updateUserPermissions(id, permissions ?? []);
    })(),
    onSuccess: () => { showToast('Admin updated successfully.'); setShowForm(false); setEditingUser(null); invalidate(); },
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
      const action = user.is_active ? 'activated' : 'deactivated';
      showToast(`Admin ${action} successfully.`);
      setTogglingUser(null);
      invalidate();
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to update admin status.', 'error'),
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const columns = useMemo(() => {
    const cols = [
      { key: 'name', header: 'Name', render: (u: User) => <span className="font-medium">{u.name}</span> },
      { key: 'email', header: 'Email' },
      { key: 'roles', header: 'Role', render: (u: User) => (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
          {(u.role ?? 'customer').replace(/_/g, ' ')}
        </span>
      ) },
      {
        key: 'status',
        header: 'Status',
        render: (u: User) => (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {u.is_active ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      { key: 'created_at', header: 'Created', render: (u: User) => new Date(u.created_at).toLocaleDateString() },
    ];
    if (canManage) {
      cols.push({
        key: 'actions',
        header: 'Actions',
        render: (u: User) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(u)} title="Edit admin">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTogglingUser(u)}
              title={u.is_active ? 'Deactivate' : 'Activate'}
            >
              {u.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </Button>
            {u.role !== 'superadmin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingUser(u)}
                title="Delete admin"
              >
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            )}
          </div>
        ),
      });
    }
    return cols;
  }, [canManage]);

  const meta = usersQuery.data?.meta ?? EMPTY_META;
  const users = usersQuery.data?.items ?? [];
  const isLoading = usersQuery.isPending;
  const error = usersQuery.error;

  if (error) {
    return <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load admins'} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage admin accounts, roles and permissions.</p>
        </div>
        {canManage && !showForm && (
          <Button onClick={handleAddNew}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Admin
          </Button>
        )}
      </div>

      {showForm ? (
        <Card className="p-6">
          <div className="mb-6">
            <Button variant="outline" onClick={handleCancelForm} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
            <h2 className="text-xl font-semibold">
              {editingUser ? 'Edit Admin' : 'Add New Admin'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {editingUser ? 'Update admin details, role and permissions.' : 'Create a new admin user with appropriate access.'}
            </p>
          </div>
          <AdminForm
            editingUser={editingUser}
            catalog={catalog}
            catalogLoading={catalogQuery.isPending}
            submitting={createMutation.isPending || updateMutation.isPending}
            onSubmit={(data) => {
              if (editingUser) {
                updateMutation.mutate({ id: editingUser.id, data });
              } else {
                createMutation.mutate(data as AdminUserFormValues & { password: string });
              }
            }}
            onCancel={handleCancelForm}
          />
        </Card>
      ) : (
        <>
          <Card className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-sm">
                <Input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-9"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <Select value={roleFilter} onChange={(e) => handleRoleFilter(e.target.value)} className="w-40">
                  <option value="">All Roles</option>
                  {catalog.roles
                    .filter((r) => ['superadmin', 'admin', 'staff', 'warehouse_manager'].includes(r.slug))
                    .map((r) => (
                      <option key={r.id} value={r.slug}>{r.name}</option>
                    ))}
                </Select>
              </div>
            </div>
          </Card>

          <Card>
            <AdminTable columns={columns} data={users} isLoading={isLoading} emptyMessage="No admin users found." />
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Showing {meta.from ?? 0} to {meta.to ?? 0} of {meta.total ?? 0} admins
              </span>
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          </Card>
        </>
      )}

      {deletingUser && (
        <ConfirmDialog
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={() => deleteMutation.mutate(deletingUser.id)}
          title="Delete Admin"
          description={`Are you sure you want to delete ${deletingUser.name}? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      )}

      {togglingUser && (
        <ConfirmDialog
          open={!!togglingUser}
          onClose={() => setTogglingUser(null)}
          onConfirm={() => toggleMutation.mutate(togglingUser.id)}
          title={togglingUser.is_active ? 'Deactivate Admin' : 'Activate Admin'}
          description={togglingUser.is_active 
            ? `Are you sure you want to deactivate ${togglingUser.name}? They will not be able to log in.`
            : `Are you sure you want to activate ${togglingUser.name}? They will be able to log in.`
          }
          confirmText={togglingUser.is_active ? 'Deactivate' : 'Activate'}
          variant={togglingUser.is_active ? 'danger' : 'default'}
        />
      )}
    </div>
  );
}

interface AdminFormProps {
  editingUser: User | null;
  catalog: AccessCatalog;
  catalogLoading: boolean;
  submitting: boolean;
  onSubmit: (data: AdminUserFormValues & { password?: string }) => void;
  onCancel: () => void;
}

function AdminForm({
  editingUser,
  catalog,
  catalogLoading,
  submitting,
  onSubmit,
  onCancel,
}: AdminFormProps) {
  const [name, setName] = useState(editingUser?.name ?? '');
  const [email, setEmail] = useState(editingUser?.email ?? '');
  const [phone, setPhone] = useState(editingUser?.phone ?? '');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(editingUser?.is_active ?? true);
  const [roles, setRoles] = useState<string[]>(editingUser?.role ? [editingUser.role] : []);
  const [permissions, setPermissions] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!editingUser && !password) newErrors.password = 'Password is required';
    else if (password && password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  if (catalogLoading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading access catalog...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          {catalog.roles
            .filter((r) => ['superadmin', 'admin', 'staff', 'warehouse_manager'].includes(r.slug))
            .map((r) => (
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

      <div className="flex justify-end gap-2 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={submitting}>
          {submitting ? 'Saving...' : editingUser ? 'Save Changes' : 'Create Admin'}
        </Button>
      </div>
    </form>
  );
}
