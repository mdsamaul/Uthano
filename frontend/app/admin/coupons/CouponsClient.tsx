'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import { Pagination } from '@/components/common/pagination';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { useAccess } from '@/hooks/use-access';
import { Coupon, PaginationMeta } from '@/types';

const EMPTY_META: PaginationMeta = { current_page: 1, last_page: 1, per_page: 20, total: 0, from: 0, to: 0 };

export function CouponsClient() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasPermission } = useAccess();
  const canManage = hasPermission('coupon.manage');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  const query = useQuery({
    queryKey: ['admin', 'coupons', page, debouncedSearch],
    queryFn: () => adminService.getCoupons(page, 20, debouncedSearch),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });

  const saveMutation = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: Partial<Coupon> }) =>
      id ? adminService.updateCoupon(id, data) : adminService.createCoupon(data),
    onSuccess: () => { showToast('Coupon saved successfully.'); setModalOpen(false); invalidate(); },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to save coupon.', 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminService.toggleCoupon(id),
    onSuccess: () => { showToast('Coupon status updated.'); invalidate(); },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to update coupon.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCoupon(id),
    onSuccess: () => { showToast('Coupon deleted successfully.'); setDeletingCoupon(null); invalidate(); },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to delete coupon.', 'error'),
  });

  const coupons = query.data?.items ?? [];
  const meta = query.data?.meta ?? EMPTY_META;
  const fmt = (n?: number | null) => (n == null ? '—' : `৳${n}`);

  const columns = [
    { key: 'code', header: 'Code', render: (c: Coupon) => <span className="font-mono font-semibold">{c.code}</span> },
        { key: 'type', header: 'Type', render: (c: Coupon) => (c.type === 'PERCENTAGE' ? 'Percent' : 'Fixed') },
    { key: 'value', header: 'Value', render: (c: Coupon) => (c.type === 'PERCENTAGE' ? `${c.value}%` : fmt(c.value)) },
    { key: 'minimum_order_amount', header: 'Min Order', render: (c: Coupon) => fmt(c.minimum_order_amount) },
    { key: 'end_at', header: 'Ends', render: (c: Coupon) => (c.end_at ? new Date(c.end_at).toLocaleDateString() : 'Never') },
    { key: 'usages_count', header: 'Usages', render: (c: Coupon) => c.usages_count ?? 0 },
    {
      key: 'status',
      header: 'Status',
      render: (c: Coupon) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
          {c.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (c: Coupon) => (
        <div className="flex flex-wrap items-center gap-2">
          {canManage && (
            <Button variant="outline" size="sm" onClick={() => toggleMutation.mutate(c.id)}>
              {c.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          )}
          {canManage && (
            <Button variant="outline" size="sm" onClick={() => { setEditingCoupon(c); setModalOpen(true); }}>
              Edit
            </Button>
          )}
          {canManage && (
            <Button variant="danger" size="sm" onClick={() => setDeletingCoupon(c)}>Delete</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        {canManage && (
          <Button onClick={() => { setEditingCoupon(null); setModalOpen(true); }}>Create Coupon</Button>
        )}
      </div>

      <Card className="p-4">
        <div className="mb-4">
          <Input
            placeholder="Search coupon code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              const v = e.target.value;
              setTimeout(() => setDebouncedSearch(v), 400);
            }}
            className="sm:max-w-xs"
          />
        </div>
        {query.isError ? (
          <ErrorMessage message="Coupons could not be loaded." onRetry={() => query.refetch()} />
        ) : (
          <>
            <AdminTable columns={columns} data={coupons} isLoading={query.isLoading} emptyMessage="No coupons found" />
            {meta.total > 0 && <Pagination meta={meta} onPageChange={setPage} className="mt-4" />}
          </>
        )}
      </Card>

      <CouponFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingCoupon={editingCoupon}
        submitting={saveMutation.isPending}
        onSubmit={(data) => saveMutation.mutate({ id: editingCoupon?.id, data })}
      />

      <ConfirmDialog
        open={!!deletingCoupon}
        onClose={() => setDeletingCoupon(null)}
        onConfirm={() => deletingCoupon && deleteMutation.mutate(deletingCoupon.id)}
        title="Delete Coupon"
        description={`Are you sure you want to delete coupon "${deletingCoupon?.code}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
function CouponFormModal({
  open,
  onClose,
  editingCoupon,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  editingCoupon: Coupon | null;
  submitting: boolean;
  onSubmit: (data: Partial<Coupon>) => void;
}) {
    const [code, setCode] = useState('');
  const [type, setType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [endAt, setEndAt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadedId, setLoadedId] = useState<number | null>(null);

  if (open && editingCoupon && editingCoupon.id !== loadedId) {
    setCode(editingCoupon.code);
    setType(editingCoupon.type);
    setValue(String(editingCoupon.value ?? ''));
    setMinOrder(editingCoupon.minimum_order_amount != null ? String(editingCoupon.minimum_order_amount) : '');
    setMaxDiscount(editingCoupon.maximum_discount != null ? String(editingCoupon.maximum_discount) : '');
    setUsageLimit(editingCoupon.usage_limit != null ? String(editingCoupon.usage_limit) : '');
    setEndAt(editingCoupon.end_at ? new Date(editingCoupon.end_at).toISOString().slice(0, 10) : '');
    setLoadedId(editingCoupon.id);
  }
  if (open && !editingCoupon && loadedId !== 0) {
        setCode(''); setType('FIXED'); setValue(''); setMinOrder(''); setMaxDiscount(''); setUsageLimit(''); setEndAt('');
    setLoadedId(0);
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!code.trim()) next.code = 'Code is required';
         if (!value || Number(value) <= 0) next.value = 'Value must be greater than 0';
    if (type === 'PERCENTAGE' && Number(value) > 100) next.value = 'Percent cannot exceed 100';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minimum_order_amount: minOrder ? Number(minOrder) : undefined,
      maximum_discount: maxDiscount ? Number(maxDiscount) : undefined,
      usage_limit: usageLimit ? Number(usageLimit) : undefined,
      end_at: endAt ? new Date(endAt).toISOString() : undefined,
      is_active: true,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={editingCoupon ? 'Edit Coupon' : 'Create Coupon'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Code</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER10" error={errors.code} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Discount Type</label>
            <select
              value={type}
                            onChange={(e) => setType(e.target.value as 'FIXED' | 'PERCENTAGE')}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="FIXED">Fixed (৳)</option>
              <option value="PERCENTAGE">Percent (%)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Value</label>
                        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'PERCENTAGE' ? '10' : '50'} error={errors.value} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Min Order (৳)</label>
            <Input value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Max Discount (৳)</label>
            <Input value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Usage Limit</label>
            <Input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Expires On</label>
          <Input type="date" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={submitting}>{submitting ? 'Saving...' : editingCoupon ? 'Save Changes' : 'Create Coupon'}</Button>
        </div>
      </form>
    </Modal>
  );
}