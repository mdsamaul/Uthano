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
import { Unit, Product } from '@/types';

import { ArrowLeft } from 'lucide-react';

// Local type matching the HarvestResource API response (frontend Harvest type is outdated)
interface HarvestOption {
  id: number;
  harvest_code: string;
  harvest_date: string;
  farm?: { id: number; farm_name?: string; district?: string };
  product?: { id: number; name?: string };
  quantity_unit?: { id: number; name: string; symbol: string };
}

export function BatchCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasPermission } = useAccess();
  const canManage = hasPermission('batch.manage');

  // Get current role from URL (superadmin, admin, etc.)
  const currentRole = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'admin' : 'admin';

  const [batchCode, setBatchCode] = useState('');
  const [harvestId, setHarvestId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitId, setUnitId] = useState('');
  const [qualityGrade, setQualityGrade] = useState('');
  const [harvestedAt, setHarvestedAt] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const harvestsQuery = useQuery({
    queryKey: ['admin', 'harvests'],
    queryFn: () => adminService.getHarvests(1, 100),
  });

  const productsQuery = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminService.getProducts(1, 100),
  });

  const unitsQuery = useQuery({
    queryKey: ['admin', 'units'],
    queryFn: () => adminService.getUnits(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminService.createBatch(data as Parameters<typeof adminService.createBatch>[0]),
    onSuccess: () => {
      showToast('Batch created successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches'] });
      router.push(`/${currentRole}/batches`);
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to create batch.', 'error'),
  });

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!harvestId) next.harvest_id = 'Harvest is required';
    if (!quantity || parseFloat(quantity) <= 0) next.quantity = 'Quantity must be greater than 0';
    if (!unitId) next.unit_id = 'Unit is required';
    if (!qualityGrade.trim()) next.quality_grade = 'Quality grade is required';
    if (!harvestedAt) next.harvested_at = 'Harvested date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createMutation.mutate({
      harvest_id: Number(harvestId),
      batch_code: batchCode || undefined,
      product_id: productId ? Number(productId) : undefined,
      quantity: parseFloat(quantity),
      unit_id: Number(unitId),
      quality_grade: qualityGrade.trim(),
      harvested_at: harvestedAt,
      expiry_date: expiryDate || undefined,
      notes: notes.trim() || undefined,
    });
  };

  if (!canManage) {
    return (
      <div className="container mx-auto p-6">
        <ErrorMessage message="You do not have permission to manage batches." />
      </div>
    );
  }

  if (harvestsQuery.isLoading || productsQuery.isLoading || unitsQuery.isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="py-8 text-center text-sm text-muted-foreground">Loading form data...</p>
      </div>
    );
  }

  const harvests = (harvestsQuery.data?.items ?? []) as unknown as HarvestOption[];
  const products = (productsQuery.data?.items ?? []) as Product[];
  const units = (unitsQuery.data ?? []) as Unit[];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push(`/${currentRole}/batches`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Batches
        </Button>
        <h1 className="text-2xl font-bold">Create Batch</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a New Harvest Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Harvest *</label>
                <Select
                  value={harvestId}
                  onChange={(e) => setHarvestId(e.target.value)}
                  error={errors.harvest_id}
                >
                  <option value="" disabled>Select a harvest</option>
                  {harvests.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.harvest_code} — {h.farm?.farm_name || 'Unknown Farm'}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Product</label>
                <Select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  <option value="">Auto from harvest</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Batch Code</label>
              <Input
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                placeholder="Auto-generated if left blank"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Quantity *</label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 500"
                  error={errors.quantity}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Unit *</label>
                <Select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  error={errors.unit_id}
                >
                  <option value="" disabled>Select a unit</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Quality Grade *</label>
                <Input
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  placeholder="e.g. Grade A"
                  error={errors.quality_grade}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Harvested At *</label>
                <Input
                  type="date"
                  value={harvestedAt}
                  onChange={(e) => setHarvestedAt(e.target.value)}
                  error={errors.harvested_at}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Expiry Date</label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => router.push(`/${currentRole}/batches`)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Batch'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
