'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/common/state-components';
import { formatBDT } from '@/lib/utils';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Product } from '@/types';

export function ProductsClient() {
  const productsQuery = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminService.getProducts(1, 50),
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
        <span className={p.stock_status === 'in_stock' ? 'text-success' : 'text-danger'}>
          {p.stock_status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p: Product) => (
        <div className="flex gap-1">
          <Link href={`/admin/products/${p.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-3 w-3" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="text-danger">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
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
    </div>
  );
}
