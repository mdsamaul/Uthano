'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { ArrowLeft } from 'lucide-react';

interface HarvestFormState {
  farm_id: string;
  product_id: string;
  quantity_unit_id: string;
  harvest_date: string;
  estimated_quantity: string;
  actual_quantity: string;
  quality_grade: string;
  status: string;
  notes: string;
}

const INITIAL_FORM: HarvestFormState = {
  farm_id: '', product_id: '', quantity_unit_id: '',
  harvest_date: '', estimated_quantity: '', actual_quantity: '',
  quality_grade: '', status: 'RECORDED', notes: '',
};

interface HarvestFormClientProps {
  harvestId?: string;
}

const HARVEST_STATUS_OPTIONS = [
  { value: 'RECORDED', label: 'Recorded' },
  { value: 'QUALITY_CHECKED', label: 'Quality Checked' },
  { value: 'BATCHED', label: 'Batched' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function HarvestFormClient({ harvestId }: HarvestFormClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const isEdit = !!harvestId;

  const currentRole = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'admin' : 'admin';
  const backPath = '/' + currentRole + '/harvests';

  const [form, setForm] = useState<HarvestFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const farmsQuery = useQuery({ queryKey: ['admin', 'farms', 'form'], queryFn: () => adminService.getFarms(1, 100), staleTime: 300000 });
  const productsQuery = useQuery({ queryKey: ['admin', 'products', 'form'], queryFn: () => adminService.getProducts(1, 100), staleTime: 300000 });
  const unitsQuery = useQuery({ queryKey: ['admin', 'units'], queryFn: () => adminService.getUnits(), staleTime: 300000 });
  const harvestQuery = useQuery({ queryKey: ['admin', 'harvests', harvestId], queryFn: () => adminService.getHarvest(Number(harvestId)), enabled: isEdit });

  useEffect(() => {
    if (!harvestQuery.data) return;
    const h = harvestQuery.data;
    setForm({
      farm_id: h.farm_id != null ? String(h.farm_id) : '',
      product_id: h.product_id != null ? String(h.product_id) : '',
      quantity_unit_id: h.quantity_unit_id != null ? String(h.quantity_unit_id) : '',
      harvest_date: h.harvest_date ? String(h.harvest_date).split('T')[0] : '',
      estimated_quantity: h.estimated_quantity != null ? String(h.estimated_quantity) : '',
      actual_quantity: h.actual_quantity != null ? String(h.actual_quantity) : '',
      quality_grade: h.quality_grade ?? '',
      status: h.status ?? 'RECORDED',
      notes: h.notes ?? '',
    });
  }, [harvestQuery.data]);

  const setField = (key: keyof HarvestFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.farm_id) next.farm_id = 'Farm is required';
    if (!form.product_id) next.product_id = 'Product is required';
    if (!form.quantity_unit_id) next.quantity_unit_id = 'Unit is required';
    if (!form.harvest_date) next.harvest_date = 'Harvest date is required';
    if (!form.actual_quantity) next.actual_quantity = 'Actual quantity is required';
    else if (isNaN(Number(form.actual_quantity)) || Number(form.actual_quantity) <= 0) next.actual_quantity = 'Enter a valid quantity greater than 0';
    if (form.estimated_quantity && (isNaN(Number(form.estimated_quantity)) || Number(form.estimated_quantity) < 0)) next.estimated_quantity = 'Enter a valid quantity';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminService.createHarvest(data),
    onSuccess: () => { showToast('Harvest created successfully.'); queryClient.invalidateQueries({ queryKey: ['admin', 'harvests'] }); router.push(backPath); },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to create harvest.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminService.updateHarvest(Number(harvestId), data),
    onSuccess: () => { showToast('Harvest updated successfully.'); queryClient.invalidateQueries({ queryKey: ['admin', 'harvests'] }); queryClient.invalidateQueries({ queryKey: ['admin', 'harvests', harvestId] }); router.push(backPath); },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to update harvest.', 'error'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: Record<string, unknown> = {
      farm_id: Number(form.farm_id),
      product_id: Number(form.product_id),
      quantity_unit_id: Number(form.quantity_unit_id),
      harvest_date: form.harvest_date,
      actual_quantity: Number(form.actual_quantity),
      status: form.status,
    };
    if (form.estimated_quantity) payload.estimated_quantity = Number(form.estimated_quantity);
    if (form.quality_grade) payload.quality_grade = form.quality_grade;
    if (form.notes) payload.notes = form.notes;
    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

    const isLoading = createMutation.isPending || updateMutation.isPending || (isEdit && harvestQuery.isLoading);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Harvest' : 'Add Harvest'}</h1>
        <Button variant="outline" onClick={() => router.push(backPath)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Harvests
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          {isEdit && harvestQuery.isError ? (
            <ErrorMessage message="Harvest could not be loaded." onRetry={() => harvestQuery.refetch()} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Farm *</label>
                  <Select value={form.farm_id} onChange={setField('farm_id')} disabled={farmsQuery.isLoading}>
                    <option value="">Select a farm</option>
                    {farmsQuery.data?.items.map((f) => (
                      <option key={f.id} value={f.id}>{f.farm_name}</option>
                    ))}
                  </Select>
                  {errors.farm_id && <p className="text-xs text-destructive">{errors.farm_id}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Product *</label>
                  <Select value={form.product_id} onChange={setField('product_id')} disabled={productsQuery.isLoading}>
                    <option value="">Select a product</option>
                    {productsQuery.data?.items.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                  {errors.product_id && <p className="text-xs text-destructive">{errors.product_id}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Harvest Date *</label>
                  <Input type="date" value={form.harvest_date} onChange={setField('harvest_date')} error={errors.harvest_date} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Estimated Quantity</label>
                  <Input type="number" min="0" step="0.01" value={form.estimated_quantity} onChange={setField('estimated_quantity')} placeholder="Optional" error={errors.estimated_quantity} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Actual Quantity *</label>
                  <Input type="number" min="0.01" step="0.01" value={form.actual_quantity} onChange={setField('actual_quantity')} placeholder="e.g. 500" error={errors.actual_quantity} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Quantity Unit *</label>
                  <Select value={form.quantity_unit_id} onChange={setField('quantity_unit_id')} disabled={unitsQuery.isLoading}>
                    <option value="">Select a unit</option>
                    {unitsQuery.data?.map((u) => (
                      <option key={u.id} value={u.id}>{u.symbol} ({u.name})</option>
                    ))}
                  </Select>
                  {errors.quantity_unit_id && <p className="text-xs text-destructive">{errors.quantity_unit_id}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Quality Grade</label>
                  <Input value={form.quality_grade} onChange={setField('quality_grade')} placeholder="e.g. A, B, Premium" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Status *</label>
                  <Select value={form.status} onChange={setField('status')}>
                    {HARVEST_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Notes</label>
                <Textarea value={form.notes} onChange={setField('notes')} placeholder="Optional notes" rows={3} />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => router.push(backPath)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {isEdit ? 'Update Harvest' : 'Create Harvest'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
