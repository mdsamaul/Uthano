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
import { ArrowLeft, Loader2 } from 'lucide-react';

interface FarmFormState {
  farmer_id: string;
  farm_name: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  village: string;
  address: string;
  latitude: string;
  longitude: string;
  land_area: string;
  land_area_unit: string;
  soil_type: string;
  irrigation_type: string;
  farming_method: string;
  status: string;
  verification_status: string;
  notes: string;
}

const INITIAL_FORM: FarmFormState = {
  farmer_id: '',
  farm_name: '',
  division: '',
  district: '',
  upazila: '',
  union: '',
  village: '',
  address: '',
  latitude: '',
  longitude: '',
  land_area: '',
  land_area_unit: '',
  soil_type: '',
  irrigation_type: '',
  farming_method: '',
  status: 'ACTIVE',
  verification_status: 'PENDING',
  notes: '',
};

interface FarmFormClientProps {
  farmId?: string;
}
export function FarmFormClient({ farmId }: FarmFormClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const isEdit = !!farmId;

  // Get current role from URL (superadmin, admin, etc.)
  const currentRole = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'admin' : 'admin';
  const backPath = `/${currentRole}/farms`;

  const [form, setForm] = useState<FarmFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const farmersQuery = useQuery({
    queryKey: ['admin', 'farmers'],
    queryFn: () => adminService.getFarmers(1, 100),
  });

  const farmQuery = useQuery({
    queryKey: ['admin', 'farms', farmId],
    queryFn: () => adminService.getFarm(Number(farmId)),
    enabled: isEdit,
  });

  // Prefill the form when editing an existing farm.
  useEffect(() => {
    if (!farmQuery.data) return;
    const f = farmQuery.data;
    setForm({
      farmer_id: f.farmer_id != null ? String(f.farmer_id) : '',
      farm_name: f.farm_name ?? '',
      division: f.division ?? '',
      district: f.district ?? '',
      upazila: f.upazila ?? '',
      union: f.union ?? '',
      village: f.village ?? '',
      address: f.address ?? '',
      latitude: f.latitude != null ? String(f.latitude) : '',
      longitude: f.longitude != null ? String(f.longitude) : '',
      land_area: f.land_area != null ? String(f.land_area) : '',
      land_area_unit: f.land_area_unit ?? '',
      soil_type: f.soil_type ?? '',
      irrigation_type: f.irrigation_type ?? '',
      farming_method: f.farming_method ?? '',
      status: f.status ?? 'ACTIVE',
      verification_status: f.verification_status ?? 'PENDING',
      notes: f.notes ?? '',
    });
  }, [farmQuery.data]);

  const setField =
    (key: keyof FarmFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.farmer_id) next.farmer_id = 'Farmer is required';
    if (form.farm_name.trim().length < 2) next.farm_name = 'Farm name is required';
    if (!form.division.trim()) next.division = 'Division is required';
    if (!form.district.trim()) next.district = 'District is required';
    if (!form.upazila.trim()) next.upazila = 'Upazila is required';
    if (!form.village.trim()) next.village = 'Village is required';

    if (form.latitude !== '') {
      const lat = Number(form.latitude);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        next.latitude = 'Latitude must be between -90 and 90';
      }
    }
    if (form.longitude !== '') {
      const lng = Number(form.longitude);
      if (Number.isNaN(lng) || lng < -180 || lng > 180) {
        next.longitude = 'Longitude must be between -180 and 180';
      }
    }
    if (form.land_area !== '') {
      const area = Number(form.land_area);
      if (Number.isNaN(area) || area < 0) {
        next.land_area = 'Land area must be 0 or more';
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const toNumberOrNull = (value: string): number | null => (value === '' ? null : Number(value));

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminService.createFarm(data),
    onSuccess: () => {
      showToast('Farm created successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'farms'] });
      router.push(backPath);
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to create farm.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminService.updateFarm(Number(farmId), data),
    onSuccess: () => {
      showToast('Farm updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'farms'] });
      router.push(backPath);
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to update farm.', 'error'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Record<string, unknown> = {
      farmer_id: Number(form.farmer_id),
      farm_name: form.farm_name.trim(),
      division: form.division.trim(),
      district: form.district.trim(),
      upazila: form.upazila.trim(),
      union: form.union.trim() || null,
      village: form.village.trim(),
      address: form.address.trim() || null,
      latitude: toNumberOrNull(form.latitude),
      longitude: toNumberOrNull(form.longitude),
      land_area: toNumberOrNull(form.land_area),
      land_area_unit: form.land_area_unit.trim() || null,
      soil_type: form.soil_type.trim() || null,
      irrigation_type: form.irrigation_type.trim() || null,
      farming_method: form.farming_method.trim() || null,
      status: form.status,
      verification_status: form.verification_status,
      notes: form.notes.trim() || null,
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  // =========================================
  // Edit mode: fetch the existing farm first.
  // =========================================
  if (isEdit && farmQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Loading farm…</p>
      </div>
    );
  }

  if (isEdit && farmQuery.isError) {
    return (
      <div className="space-y-4">
        <ErrorMessage message="Farm could not be loaded." onRetry={() => farmQuery.refetch()} />
        <Button variant="outline" onClick={() => router.push(backPath)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Farms
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Farm' : 'Add Farm'}</h1>
        <Button variant="outline" onClick={() => router.push(backPath)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Farms
        </Button>
      </div>
<Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Farmer + Farm name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Farmer *</label>
                <Select value={form.farmer_id} onChange={setField('farmer_id')} error={errors.farmer_id}>
                  <option value="" disabled>
                    Select a farmer
                  </option>
                  {(farmersQuery.data?.items || []).map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.full_name} ({farmer.farmer_code})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Farm Name *</label>
                <Input
                  value={form.farm_name}
                  onChange={setField('farm_name')}
                  placeholder="e.g. Rahim Agro Farm"
                  error={errors.farm_name}
                />
              </div>
            </div>

            {/* Location fields */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Division *</label>
                <Input value={form.division} onChange={setField('division')} placeholder="e.g. Khulna" error={errors.division} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">District *</label>
                <Input value={form.district} onChange={setField('district')} placeholder="e.g. Jhenaidah" error={errors.district} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Upazila *</label>
                <Input value={form.upazila} onChange={setField('upazila')} placeholder="e.g. Shailkupa" error={errors.upazila} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Union</label>
                <Input value={form.union} onChange={setField('union')} placeholder="Optional" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Village *</label>
                <Input value={form.village} onChange={setField('village')} placeholder="e.g. Moheshpur" error={errors.village} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Address</label>
              <Textarea value={form.address} onChange={setField('address')} placeholder="Full address (optional)" rows={2} />
            </div>

            {/* Coordinates + land */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
<div>
                <label className="mb-1 block text-sm font-medium">Latitude</label>
                <Input type="number" step="any" value={form.latitude} onChange={setField('latitude')} placeholder="23.9" error={errors.latitude} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Longitude</label>
                <Input type="number" step="any" value={form.longitude} onChange={setField('longitude')} placeholder="89.1" error={errors.longitude} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Land Area</label>
                <Input type="number" min="0" step="0.01" value={form.land_area} onChange={setField('land_area')} placeholder="e.g. 5" error={errors.land_area} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Area Unit</label>
                <Input value={form.land_area_unit} onChange={setField('land_area_unit')} placeholder="e.g. bigha / acre" />
              </div>
            </div>
            {/* Farming details */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Soil Type</label>
                <Input value={form.soil_type} onChange={setField('soil_type')} placeholder="e.g. Clay" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Irrigation Type</label>
                <Input value={form.irrigation_type} onChange={setField('irrigation_type')} placeholder="e.g. Drip" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Farming Method</label>
                <Input value={form.farming_method} onChange={setField('farming_method')} placeholder="e.g. Organic" />
              </div>
            </div>

            {/* Statuses */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Status *</label>
                <Select value={form.status} onChange={setField('status')}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Verification Status</label>
                <Select value={form.verification_status} onChange={setField('verification_status')}>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
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
                {isEdit ? 'Update Farm' : 'Create Farm'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}