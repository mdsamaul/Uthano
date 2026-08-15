'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { useAccess } from '@/hooks/use-access';
import { ArrowDownToLine, ArrowUpFromLine, Plus } from 'lucide-react';
import { Inventory, Product, Warehouse } from '@/types';

interface BatchOption {
  id: number;
  batch_code: string;
  product_id: number;
  product_name?: string;
  remaining_quantity: number;
  unit: string;
  status: string;
}

const STOCK_OUT_REASONS = ['ADJUSTMENT', 'DAMAGED', 'EXPIRED', 'RETURNED'];

export function InventoryClient() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasPermission } = useAccess();
  const canAdjust = hasPermission('inventory.adjust');

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [stockOutItem, setStockOutItem] = useState<Inventory | null>(null);
  const [receiveForm, setReceiveForm] = useState({
    harvest_batch_id: '',
    product_id: '',
    warehouse_id: '',
    quantity: '',
    notes: '',
  });
  const [stockOutForm, setStockOutForm] = useState({
    quantity: '',
    reason: 'ADJUSTMENT',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inventoryQuery = useQuery({
    queryKey: ['admin', 'inventory'],
    queryFn: () => adminService.getInventory(1, 50),
  });

  const productsQuery = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminService.getProducts(1, 100),
  });

  const batchesQuery = useQuery({
    queryKey: ['admin', 'batches'],
    queryFn: () => adminService.getBatches(1, 100),
  });

  const warehousesQuery = useQuery({
    queryKey: ['admin', 'warehouses'],
    queryFn: () => adminService.getWarehouses(),
  });

  const products = (productsQuery.data?.items ?? []) as Product[];
  const batches = (batchesQuery.data?.items ?? []) as unknown as BatchOption[];
    const warehouses = (warehousesQuery.data?.items ?? []) as Warehouse[];

  const flushQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'batches'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
  };

const receiveMutation = useMutation({
    mutationFn: () => {
      const batch = batches.find((b) => String(b.id) === receiveForm.harvest_batch_id);
      const product = products.find((p) => String(p.id) === receiveForm.product_id);
      return adminService.receiveInventory({
        product_id: Number(receiveForm.product_id),
        harvest_batch_id: Number(receiveForm.harvest_batch_id),
        warehouse_id: Number(receiveForm.warehouse_id),
        quantity: Number(receiveForm.quantity),
        unit_id: Number(product?.unit_id ?? batch?.unit ?? 1),
        notes: receiveForm.notes || undefined,
      });
    },
    onSuccess: () => {
      showToast('Stock received successfully.');
      setReceiveOpen(false);
      setReceiveForm({ harvest_batch_id: '', product_id: '', warehouse_id: '', quantity: '', notes: '' });
      setErrors({});
      flushQueries();
    },
    onError: (err) => {
      showToast(err instanceof Error ? err.message : 'Unable to receive stock.', 'error');
    },
  });

  const stockOutMutation = useMutation({
    mutationFn: () =>
      adminService.stockOut(stockOutItem!.id, {
        quantity: Number(stockOutForm.quantity),
        reason: stockOutForm.reason,
        notes: stockOutForm.notes || undefined,
      }),
    onSuccess: () => {
      showToast('Stock removed successfully.');
      setStockOutItem(null);
      setStockOutForm({ quantity: '', reason: 'ADJUSTMENT', notes: '' });
      setErrors({});
      flushQueries();
    },
    onError: (err) => {
      showToast(err instanceof Error ? err.message : 'Unable to remove stock.', 'error');
    },
  });

  const handleBatchSelect = (value: string) => {
    const batch = batches.find((b) => String(b.id) === value);
    setReceiveForm((prev) => ({
      ...prev,
      harvest_batch_id: value,
      product_id: batch ? String(batch.product_id) : prev.product_id,
    }));
  };

  const submitReceive = () => {
    const next: Record<string, string> = {};
    if (!receiveForm.harvest_batch_id) next.harvest_batch_id = 'Select a batch';
    if (!receiveForm.product_id) next.product_id = 'Select a product';
    if (!receiveForm.warehouse_id) next.warehouse_id = 'Select a warehouse';
    if (!receiveForm.quantity || Number(receiveForm.quantity) <= 0) next.quantity = 'Enter a quantity greater than 0';
    setErrors(next);
    if (Object.keys(next).length === 0) receiveMutation.mutate();
  };

  const submitStockOut = () => {
    const next: Record<string, string> = {};
    if (!stockOutForm.quantity || Number(stockOutForm.quantity) <= 0) next.quantity = 'Enter a quantity greater than 0';
    if (stockOutItem && Number(stockOutForm.quantity) > stockOutItem.available_quantity) {
      next.quantity = `Max available is ${stockOutItem.available_quantity}`;
    }
    setErrors(next);
    if (Object.keys(next).length === 0) stockOutMutation.mutate();
  };

const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (i: Inventory) => (
        <div>
          <p className="font-medium">{i.product?.name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{i.product?.sku}</p>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Batch & Source',
      render: (i: Inventory) => {
        const farm = i.harvest_batch?.harvest?.farm;
        return (
          <div>
            <p className="text-xs font-medium">{i.harvest_batch?.batch_code ?? '—'}</p>
            {farm ? (
              <p className="text-xs text-muted-foreground">
                {farm.farm_name}
                {farm.farmer ? ` · ${farm.farmer.full_name}` : ''}
                {farm.district ? ` · ${farm.district}` : ''}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">—</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (i: Inventory) => i.warehouse?.name ?? '—',
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (i: Inventory) => (
        <div>
          <p className="text-sm">
            {i.quantity} {i.unit?.symbol ?? ''}
          </p>
          <p className="text-xs text-muted-foreground">
            Available: {i.available_quantity} {i.unit?.symbol ?? ''}
            {i.reserved_quantity > 0 ? ` · Reserved: ${i.reserved_quantity}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (i: Inventory) => (
        <Badge variant={i.available_quantity < 10 ? 'warning' : 'success'}>
          {i.available_quantity < 10 ? 'Low Stock' : 'In Stock'}
        </Badge>
      ),
    },
    ...(canAdjust
      ? [
          {
            key: 'actions',
            header: 'Actions',
            render: (i: Inventory) => (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStockOutItem(i)}
                disabled={i.available_quantity <= 0}
              >
                <ArrowUpFromLine className="mr-1 h-3 w-3" /> Stock Out
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Stock In adds stock from a farm harvest batch. Stock Out removes damaged/expired/returned items.
          </p>
        </div>
        {canAdjust && (
          <Button onClick={() => setReceiveOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Stock In
          </Button>
        )}
      </div>

      <Card className="p-4">
        {inventoryQuery.isError ? (
          <ErrorMessage message="Inventory could not be loaded." onRetry={() => inventoryQuery.refetch()} />
        ) : (
          <AdminTable
            columns={columns}
            data={inventoryQuery.data?.items || []}
            isLoading={inventoryQuery.isLoading}
            emptyMessage="No inventory found. Use 'Stock In' to add stock from a farm batch."
          />
        )}
      </Card>

{/* Stock In modal */}
      <Modal open={receiveOpen} onClose={() => setReceiveOpen(false)} title="Stock In (Receive)" description="Receive stock from a harvest batch into a warehouse.">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Harvest Batch *</label>
            <Select value={receiveForm.harvest_batch_id} onChange={(e) => handleBatchSelect(e.target.value)}>
              <option value="">Select batch</option>
              {batches
                .filter((b) => b.remaining_quantity > 0)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batch_code} — {b.product_name} (remaining: {b.remaining_quantity} {b.unit})
                  </option>
                ))}
            </Select>
            {errors.harvest_batch_id && <p className="mt-1 text-xs text-danger">{errors.harvest_batch_id}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Product *</label>
            <Select
              value={receiveForm.product_id}
              onChange={(e) => setReceiveForm((prev) => ({ ...prev, product_id: e.target.value }))}
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </Select>
            {errors.product_id && <p className="mt-1 text-xs text-danger">{errors.product_id}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Warehouse *</label>
            <Select
              value={receiveForm.warehouse_id}
              onChange={(e) => setReceiveForm((prev) => ({ ...prev, warehouse_id: e.target.value }))}
            >
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.district})
                </option>
              ))}
            </Select>
            {errors.warehouse_id && <p className="mt-1 text-xs text-danger">{errors.warehouse_id}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Quantity *</label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={receiveForm.quantity}
              onChange={(e) => setReceiveForm((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder="e.g. 100"
            />
            {errors.quantity && <p className="mt-1 text-xs text-danger">{errors.quantity}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <Textarea
              rows={2}
              value={receiveForm.notes}
              onChange={(e) => setReceiveForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setReceiveOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitReceive} isLoading={receiveMutation.isPending}>
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Receive Stock
            </Button>
          </div>
        </div>
      </Modal>

{/* Stock Out modal */}
      <Modal
        open={!!stockOutItem}
        onClose={() => setStockOutItem(null)}
        title="Stock Out"
        description={
          stockOutItem
            ? `${stockOutItem.product?.name} — Available: ${stockOutItem.available_quantity} ${stockOutItem.unit?.symbol ?? ''}`
            : undefined
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Quantity *</label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={stockOutForm.quantity}
              onChange={(e) => setStockOutForm((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder={`Max ${stockOutItem?.available_quantity ?? 0}`}
            />
            {errors.quantity && <p className="mt-1 text-xs text-danger">{errors.quantity}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Reason *</label>
            <Select
              value={stockOutForm.reason}
              onChange={(e) => setStockOutForm((prev) => ({ ...prev, reason: e.target.value }))}
            >
              {STOCK_OUT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <Textarea
              rows={2}
              value={stockOutForm.notes}
              onChange={(e) => setStockOutForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setStockOutItem(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={submitStockOut} isLoading={stockOutMutation.isPending}>
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Remove Stock
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
