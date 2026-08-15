'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { useAccess } from '@/hooks/use-access';
import { Product, Warehouse, HarvestBatch } from '@/types';

import { ArrowLeft } from 'lucide-react';

interface ReceiveFormValues {
  harvest_batch_id: string;
  product_id: string;
  warehouse_id: string;
  quantity: string;
  notes: string;
}

export function StockInPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasPermission } = useAccess();
  const canAdjust = hasPermission('inventory.adjust');

  // Get current role from URL (superadmin, admin, etc.)
  const currentRole = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'admin' : 'admin';

  const [harvestBatches, setHarvestBatches] = useState<HarvestBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [form, setForm] = useState<ReceiveFormValues>({
    harvest_batch_id: '',
    product_id: '',
    warehouse_id: '',
    quantity: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch related data
  const batchesQuery = useQuery({
    queryKey: ['admin', 'batches'],
    queryFn: () => adminService.getBatches(1, 100),
  });

  const productsQuery = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminService.getProducts(1, 100),
  });

  const warehousesQuery = useQuery({
    queryKey: ['admin', 'warehouses'],
    queryFn: () => adminService.getWarehouses(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminService.receiveInventory(data as Parameters<typeof adminService.receiveInventory>[0]),
    onSuccess: () => {
      showToast('Stock received successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      router.push(`/${currentRole}/inventory`);
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to receive stock.', 'error'),
  });

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.harvest_batch_id) next.harvest_batch_id = 'Harvest batch is required';
    if (!form.product_id) next.product_id = 'Product is required';
    if (!form.warehouse_id) next.warehouse_id = 'Warehouse is required';
    if (!form.quantity || Number(form.quantity) <= 0) next.quantity = 'Quantity must be greater than 0';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({
      product_id: Number(form.product_id),
      harvest_batch_id: Number(form.harvest_batch_id),
      warehouse_id: Number(form.warehouse_id),
      quantity: parseFloat(form.quantity),
      unit_id: undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  if (!canAdjust) {
    return (
      <div className="container mx-auto p-6">
        <ErrorMessage message="You do not have permission to adjust inventory." />
      </div>
    );
  }

  if (batchesQuery.isLoading || productsQuery.isLoading || warehousesQuery.isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="py-8 text-center text-sm text-muted-foreground">Loading form data...</p>
      </div>
    );
  }

  // Initialize state on mount
  const initState = () => {
    setHarvestBatches(batchesQuery.data?.items ?? []);
    setProducts(productsQuery.data?.items ?? []);
    setWarehouses(warehousesQuery.data ?? []);
  };

  // Run after queries settle
  useEffect(() => {
    initState();
  }, [batchesQuery.data, productsQuery.data, warehousesQuery.data]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push(`/${currentRole}/inventory`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
        <h1 className="text-2xl font-bold">Receive Stock</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receive Stock from Harvest Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Harvest Batch *</label>
                <Select
                  value={form.harvest_batch_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, harvest_batch_id: e.target.value }))}
                  error={errors.harvest_batch_id}
                >
                  <option value="" disabled>Select a batch</option>
                  {harvestBatches.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.batch_code} — {b.product?.name || 'Product'}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Product</label>
                <Select
                  value={form.product_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, product_id: e.target.value }))}
                >
                  <option value="">Auto from batch</option>
                  {products.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Warehouse *</label>
              <Select
                value={form.warehouse_id}
                onChange={(e) => setForm((prev) => ({ ...prev, warehouse_id: e.target.value }))}
              >
                <option value="" disabled>Select a warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={String(w.id)}>
                    {w.name} ({w.warehouse_code})
                  </option>
                ))}
              </Select>
            </div>
          </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Quantity *</label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                placeholder="e.g. 100"
                error={errors.quantity}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => router.push(`/${currentRole}/inventory`)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                {createMutation.isPending ? 'Receiving...' : 'Receive Stock'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
