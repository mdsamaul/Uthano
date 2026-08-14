'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/modal';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { useAccess } from '@/hooks/use-access';
import { formatBDT, STOCK_STATUS_LABELS, STOCK_STATUS_COLORS } from '@/lib/utils';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Product } from '@/types';

export function ProductsClient() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasAdminAccess } = useAccess();
  const canManage = hasAdminAccess;
  const canDelete = hasAdminAccess;

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const productsQuery = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminService.getProducts(1, 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteProduct(id),
    onSuccess: () => {
      showToast('Product deleted successfully.');
      setDeletingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to delete product.', 'error'),
  });

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (p: Product) => (
        <div>
          <p className="font-medium">{p.name}</p>
          <p className="text-xs text-muted-foreground">{p.sku}</p>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (p: Product) => formatBDT(p.price),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p: Product) => (
        <Badge className={STOCK_STATUS_COLORS[p.stock_status] ?? ''}>
          {STOCK_STATUS_LABELS[p.stock_status] ?? p.stock_status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p: Product) => (
        <div className="flex gap-1">
          {canManage && (
            <Link href={`/admin/products/${p.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Edit className="h-3 w-3" />
              </Button>
            </Link>
          )}
          {canDelete && (
            <Button variant="ghost" size="sm" className="text-danger" onClick={() => setDeletingProduct(p)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        {canManage && (
          <Link href="/admin/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        )}
      </div>

      <Card className="p-4">
        {productsQuery.isError ? (
          <ErrorMessage message="Products could not be loaded." onRetry={() => productsQuery.refetch()} />
        ) : (
          <AdminTable
            columns={columns}
            data={productsQuery.data?.items || []}
            isLoading={productsQuery.isLoading}
            emptyMessage="No products found"
          />
        )}
      </Card>

      <ConfirmDialog
        open={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => deletingProduct && deleteMutation.mutate(deletingProduct.id)}
        title="Delete Product"
        description={`Are you sure you want to permanently delete "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
