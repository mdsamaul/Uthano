'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { slugify } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Category, Product, Unit } from '@/types';

const PRODUCT_TYPES = ['FRESH', 'PACKAGED', 'ORGANIC', 'PROCESSED'];
const PRODUCT_STATUSES = ['DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED'];

interface FormState {
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  unit_id: string;
  product_type: string;
  status: string;
  base_price: string;
  selling_price: string;
  cost_price: string;
  minimum_order_quantity: string;
  maximum_order_quantity: string;
  description: string;
  short_description: string;
  is_featured: boolean;
  is_active: boolean;
  stock_tracking: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  sku: '',
  category_id: '',
  unit_id: '',
  product_type: 'FRESH',
  status: 'ACTIVE',
  base_price: '',
  selling_price: '',
  cost_price: '',
  minimum_order_quantity: '1',
  maximum_order_quantity: '',
  description: '',
  short_description: '',
  is_featured: false,
  is_active: true,
  stock_tracking: true,
};

function buildPayload(form: FormState): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    sku: form.sku.trim(),
    category_id: Number(form.category_id),
    unit_id: Number(form.unit_id),
    product_type: form.product_type,
    status: form.status,
    base_price: Number(form.base_price) || 0,
    selling_price: Number(form.selling_price) || 0,
    cost_price: form.cost_price ? Number(form.cost_price) : null,
    minimum_order_quantity: form.minimum_order_quantity ? Number(form.minimum_order_quantity) : null,
    stock_tracking: form.stock_tracking,
    is_featured: form.is_featured,
    is_active: form.is_active,
    description: form.description || null,
    short_description: form.short_description || null,
  };

  if (form.maximum_order_quantity) {
    payload.maximum_order_quantity = Number(form.maximum_order_quantity);
  }

    return payload;
}

export function ProductFormClient({ productId }: { productId?: string }) {
  const router = useRouter();
  const showToast = useUIStore((s) => s.showToast);
  const isEdit = !!productId;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadedId, setLoadedId] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminService.getCategories(),
  });
  const unitsQuery = useQuery({
    queryKey: ['admin', 'units'],
    queryFn: () => adminService.getUnits(),
  });
  const productQuery = useQuery({
    queryKey: ['admin', 'products', productId],
    queryFn: () => adminService.getProduct(Number(productId)),
    enabled: isEdit,
  });

  const categories = categoriesQuery.data ?? [];
  const units = unitsQuery.data ?? [];
  const product = productQuery.data as Product | undefined;

  // Prefill the form once the product (edit mode), categories and units are loaded.
  useEffect(() => {
    if (!isEdit) {
      setLoadedId('new');
      return;
    }
    if (product && categories.length > 0 && units.length > 0 && loadedId !== String(productId)) {
      setForm({
        name: product.name ?? '',
        slug: product.slug ?? '',
        sku: product.sku ?? '',
        category_id: String(product.category_id ?? ''),
        unit_id: String(product.unit_id ?? ''),
        product_type: product.product_type ?? 'FRESH',
        status: product.is_active === false ? 'INACTIVE' : product.status === 'draft' ? 'DRAFT' : 'ACTIVE',
        base_price: product.base_price != null ? String(product.base_price) : '',
        selling_price: product.price != null ? String(product.price) : '',
        cost_price: product.cost_price != null ? String(product.cost_price) : '',
        minimum_order_quantity: product.min_order_qty != null ? String(product.min_order_qty) : '1',
        maximum_order_quantity: product.max_order_qty != null && product.max_order_qty > 0 ? String(product.max_order_qty) : '',
        description: product.description ?? '',
        short_description: product.short_description ?? '',
        is_featured: !!product.featured,
        is_active: product.is_active !== false,
        stock_tracking: true,
      });
      setLoadedId(String(productId));
    }
  }, [isEdit, product, categories.length, units.length, loadedId, productId]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.sku.trim()) next.sku = 'SKU is required';
    if (!form.category_id) next.category_id = 'Select a category';
    if (!form.unit_id) next.unit_id = 'Select a unit';
    if (Number(form.selling_price) < 0) next.selling_price = 'Price cannot be negative';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload(form);
      if (isEdit) {
        return adminService.updateProduct(Number(productId), payload);
      }
      return adminService.createProduct(payload);
    },
    onSuccess: () => {
      showToast(isEdit ? 'Product updated successfully.' : 'Product created successfully.');
      router.push('/admin/products');
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to save product.', 'error'),
  });

  const setField = (key: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    saveMutation.mutate();
  };

  if (productQuery.isError) {
    return (
      <div className="space-y-4">
        <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <ErrorMessage message="Product could not be loaded." onRetry={() => productQuery.refetch()} />
      </div>
    );
  }
return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => {
                  setField('name', e.target.value);
                  if (!form.slug || form.slug === slugify(form.name)) {
                    setField('slug', slugify(e.target.value));
                  }
                }}
                placeholder="Fresh Mango"
                error={errors.name}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug</label>
              <Input value={form.slug} onChange={(e) => setField('slug', e.target.value)} placeholder="fresh-mango" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">SKU *</label>
              <Input value={form.sku} onChange={(e) => setField('sku', e.target.value)} placeholder="UTH-MANGO-001" error={errors.sku} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Category *</label>
              <Select
                value={form.category_id}
                onChange={(e) => setField('category_id', e.target.value)}
                error={errors.category_id}
              >
                <option value="">Select category</option>
                {categories.map((c: Category) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Unit *</label>
              <Select value={form.unit_id} onChange={(e) => setField('unit_id', e.target.value)} error={errors.unit_id}>
                <option value="">Select unit</option>
                {units.map((u: Unit) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Product Type</label>
              <Select value={form.product_type} onChange={(e) => setField('product_type', e.target.value)}>
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select value={form.status} onChange={(e) => setField('status', e.target.value)}>
                {PRODUCT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Quantity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Base Price (৳)</label>
              <Input
                type="number"
                step="0.01"
                value={form.base_price}
                onChange={(e) => setField('base_price', e.target.value)}
                placeholder="80"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Selling Price (৳) *</label>
              <Input
                type="number"
                step="0.01"
                value={form.selling_price}
                onChange={(e) => setField('selling_price', e.target.value)}
                placeholder="100"
                error={errors.selling_price}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cost Price (৳)</label>
              <Input
                type="number"
                step="0.01"
                value={form.cost_price}
                onChange={(e) => setField('cost_price', e.target.value)}
                placeholder="60"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Min Order Quantity</label>
              <Input
                type="number"
                step="0.01"
                value={form.minimum_order_quantity}
                onChange={(e) => setField('minimum_order_quantity', e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max Order Quantity</label>
              <Input
                type="number"
                step="0.01"
                value={form.maximum_order_quantity}
                onChange={(e) => setField('maximum_order_quantity', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </CardContent>
        </Card>
<Card>
          <CardHeader>
            <CardTitle>Description & Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Short Description</label>
              <Input
                value={form.short_description}
                onChange={(e) => setField('short_description', e.target.value)}
                placeholder="Sweet and juicy mango"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Full Description</label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Detailed product description..."
              />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setField('is_active', e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                <span className="text-sm">Active (visible in store)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setField('is_featured', e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.stock_tracking}
                  onChange={(e) => setField('stock_tracking', e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                <span className="text-sm">Track Stock</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link href="/admin/products">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saveMutation.isPending || (isEdit && productQuery.isLoading)} isLoading={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
        </div>
  );
}