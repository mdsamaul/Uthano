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

interface FarmerFormState {
  full_name: string;
  phone: string;
  alternate_phone: string;
  national_id: string;
  status: string;
  verification_status: string;
  notes: string;
}

const INITIAL_FORM: FarmerFormState = {
  full_name: '',
  phone: '',
  alternate_phone: '',
  national_id: '',
  status: 'ACTIVE',
  verification_status: 'PENDING',
  notes: '',
};

interface FarmerFormClientProps {
  farmerId?: string;
}
export function FarmerFormClient({ farmerId }: FarmerFormClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const isEdit = !!farmerId;

  // Get current role from URL (superadmin, admin, etc.)
  const currentRole = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'admin' : 'admin';
  const backPath = `/${currentRole}/farmers`;

  const [form, setForm] = useState<FarmerFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const farmerQuery = useQuery({
    queryKey: ['admin', 'farmers', farmerId],
    queryFn: () => adminService.getFarmer(Number(farmerId)),
    enabled: isEdit,
  });

  // Prefill the form when editing an existing farmer.
  useEffect(() => {
    if (!farmerQuery.data) return;
    const f = farmerQuery.data;
    setForm({
      full_name: f.full_name ?? '',
      phone: f.phone ?? '',
      alternate_phone: f.alternate_phone ?? '',
      national_id: f.national_id ?? '',
      status: f.status ?? 'ACTIVE',
      verification_status: f.verification_status ?? 'PENDING',
      notes: f.notes ?? '',
    });
  }, [farmerQuery.data]);

  const setField =
    (key: keyof FarmerFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const PHONE_REGEX = /^01[3-9]\d{8}$/;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (form.full_name.trim().length < 2) next.full_name = 'Full name is required';
    if (!form.phone.trim()) next.phone = 'Phone is required';
    else if (!PHONE_REGEX.test(form.phone.trim())) next.phone = 'Enter a valid Bangladeshi phone (e.g. 01712345678)';
    if (form.alternate_phone.trim() && !PHONE_REGEX.test(form.alternate_phone.trim())) {
      next.alternate_phone = 'Enter a valid phone or leave blank';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminService.createFarmer(data),
    onSuccess: () => {
      showToast('Farmer created successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'farmers'] });
      router.push(backPath);
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to create farmer.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminService.updateFarmer(Number(farmerId), data),
    onSuccess: () => {
      showToast('Farmer updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'farmers'] });
      router.push(backPath);
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to update farmer.', 'error'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Record<string, unknown> = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      alternate_phone: form.alternate_phone.trim() || null,
      national_id: form.national_id.trim() || null,
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
  // Edit mode: fetch the existing farmer first.
  // =========================================
  if (isEdit && farmerQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Loading farmer…</p>
      </div>
    );
  }

  if (isEdit && farmerQuery.isError) {
    return (
      <div className="space-y-4">
        <ErrorMessage message="Farmer could not be loaded." onRetry={() => farmerQuery.refetch()} />
        <Button variant="outline" onClick={() => router.push(backPath)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Farmers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Farmer' : 'Add Farmer'}</h1>
        <Button variant="outline" onClick={() => router.push(backPath)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Farmers
        </Button>
      </div>
<Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Full Name *</label>
                <Input
                  value={form.full_name}
                  onChange={setField('full_name')}
                  placeholder="e.g. Rahim Ahmed"
                  error={errors.full_name}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone *</label>
                <Input
                  value={form.phone}
                  onChange={setField('phone')}
                  placeholder="e.g. 01712345678"
                  error={errors.phone}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Alternate Phone</label>
                <Input
                  value={form.alternate_phone}
                  onChange={setField('alternate_phone')}
                  placeholder="Optional"
                  error={errors.alternate_phone}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">National ID</label>
                <Input value={form.national_id} onChange={setField('national_id')} placeholder="Optional" />
              </div>
            </div>

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
                {isEdit ? 'Update Farmer' : 'Create Farmer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}