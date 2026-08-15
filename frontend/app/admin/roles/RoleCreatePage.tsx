'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PermissionChecklist } from '@/components/admin/PermissionChecklist';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { useAccess } from '@/hooks/use-access';

import { ArrowLeft } from 'lucide-react';

export function RoleCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasPermission } = useAccess();
  const canManage = hasPermission('role.manage') || hasPermission('permission.manage');

  // Get current role from URL (superadmin, admin, etc.)
  const currentRole = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'admin' : 'admin';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [permissionIds, setPermissionIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const catalogQuery = useQuery({
    queryKey: ['admin', 'access', 'catalog'],
    queryFn: () => adminService.getAccessCatalog(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; description?: string; permissions?: number[] }) =>
      adminService.createRole(data),
    onSuccess: () => {
      showToast('Role created successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      router.push(`/${currentRole}/roles`);
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to create role.', 'error'),
  });

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
    createMutation.mutate({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      permissions: permissionIds,
    });
  };

  if (!canManage) {
    return (
      <div className="container mx-auto p-6">
        <ErrorMessage message="You do not have permission to manage roles." />
      </div>
    );
  }

  if (catalogQuery.isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="py-8 text-center text-sm text-muted-foreground">Loading permissions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push(`/${currentRole}/roles`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Roles
        </Button>
        <h1 className="text-2xl font-bold">Create Role</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a New Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Role Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Product Manager"
                  error={errors.name}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Slug</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="product_manager"
                  error={errors.slug}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Permissions</p>
              <PermissionChecklist
                groups={catalogQuery.data?.permissions ?? {}}
                selected={permissionIds}
                onChange={setPermissionIds}
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => router.push(`/${currentRole}/roles`)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Role'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
