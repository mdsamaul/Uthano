'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ErrorMessage } from '@/components/common/state-components';
import { Category } from '@/types';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function CategoriesClient() {
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    is_active: true,
    sort_order: 0,
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Category>) => adminService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setIsFormOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) =>
      adminService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setIsFormOpen(false);
      setEditingCategory(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      parent_id: '',
      is_active: true,
      sort_order: 0,
    });
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id ? String(category.parent_id) : '',
      is_active: category.is_active !== false,
      sort_order: 0,
    });
    setIsFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data: Partial<Category> = {
      name: formData.name,
      description: formData.description || undefined,
      is_active: formData.is_active,
    };
    if (formData.parent_id) {
      data.parent_id = Number(formData.parent_id);
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'slug',
      header: 'Slug',
      render: (c: Category) => <span className="text-muted-foreground">{c.slug}</span>,
    },
    {
      key: 'product_count',
      header: 'Products',
      render: (c: Category) => <Badge variant="secondary">{c.product_count ?? 0}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (c: Category) =>
        c.is_active !== false ? (
          <Badge className="bg-green-100 text-green-700">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (c: Category) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger"
            onClick={() => deleteMutation.mutate(c.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => { setEditingCategory(null); resetForm(); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {isFormOpen && (
        <Card className="p-4">
          <h2 className="mb-4 text-lg font-semibold">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-border"
                />
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCategory ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsFormOpen(false); setEditingCategory(null); resetForm(); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4">
        {categoriesQuery.isError ? (
          <ErrorMessage
            message="Categories could not be loaded."
            onRetry={() => categoriesQuery.refetch()}
          />
        ) : (
          <AdminTable
            columns={columns}
            data={categoriesQuery.data || []}
            isLoading={categoriesQuery.isLoading}
            emptyMessage="No categories found"
          />
        )}
      </Card>
    </div>
  );
}