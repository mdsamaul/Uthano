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
import { useRolePath } from '@/lib/role-utils';
import { AdminFarmer } from '@/types';
import { Edit, Trash2, Plus } from 'lucide-react';

const FARMER_STATUS_VARIANTS: Record<string, 'success' | 'secondary' | 'danger'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  SUSPENDED: 'danger',
};

export const FARMER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

const VERIFICATION_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  VERIFIED: 'success',
  PENDING: 'warning',
  REJECTED: 'danger',
};

export const FARMER_VERIFICATION_LABELS: Record<string, string> = {
  VERIFIED: 'Verified',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
};

export function FarmersClient() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasAdminAccess } = useAccess();
  const { to } = useRolePath();
  const canManage = hasAdminAccess;
  const canDelete = hasAdminAccess;

  const [deletingFarmer, setDeletingFarmer] = useState<AdminFarmer | null>(null);

  const farmersQuery = useQuery({
    queryKey: ['admin', 'farmers'],
    queryFn: () => adminService.getFarmers(1, 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteFarmer(id),
    onSuccess: () => {
      showToast('Farmer deleted successfully.');
      setDeletingFarmer(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'farmers'] });
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to delete farmer.', 'error'),
  });

  const columns = [
    {
      key: 'full_name',
      header: 'Farmer',
      render: (f: AdminFarmer) => (
        <div>
          <p className="font-medium">{f.full_name}</p>
          <p className="text-xs text-muted-foreground">{f.farmer_code}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (f: AdminFarmer) => (
        <div>
          <p className="text-sm">{f.phone}</p>
          {f.alternate_phone && <p className="text-xs text-muted-foreground">{f.alternate_phone}</p>}
        </div>
      ),
    },
    {
      key: 'farms_count',
      header: 'Farms',
      render: (f: AdminFarmer) => <span>{f.farms_count != null ? f.farms_count : '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (f: AdminFarmer) => (
        <Badge variant={FARMER_STATUS_VARIANTS[f.status] ?? 'secondary'}>
          {FARMER_STATUS_LABELS[f.status] ?? f.status}
        </Badge>
      ),
    },
    {
      key: 'verification_status',
      header: 'Verification',
      render: (f: AdminFarmer) => (
        <Badge variant={VERIFICATION_VARIANTS[f.verification_status] ?? 'secondary'}>
          {FARMER_VERIFICATION_LABELS[f.verification_status] ?? f.verification_status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (f: AdminFarmer) => (
        <div className="flex gap-1">
          {canManage && (
            <Link href={to(`/farmers/${f.id}/edit`)}>              <Button variant="ghost" size="sm" aria-label={`Edit ${f.full_name}`}>
                <Edit className="h-3 w-3" />
              </Button>
            </Link>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-danger"
              aria-label={`Delete ${f.full_name}`}
              onClick={() => setDeletingFarmer(f)}
            >
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
        <h1 className="text-2xl font-bold">Farmers</h1>
        {canManage && (
          <Link href={to('/farmers/new')}>            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Farmer
            </Button>
          </Link>
        )}
      </div>

      <Card className="p-4">
        {farmersQuery.isError ? (
          <ErrorMessage message="Farmers could not be loaded." onRetry={() => farmersQuery.refetch()} />
        ) : (
          <AdminTable
            columns={columns}
            data={farmersQuery.data?.items || []}
            isLoading={farmersQuery.isLoading}
            emptyMessage="No farmers found"
          />
        )}
      </Card>

      <ConfirmDialog
        open={!!deletingFarmer}
        onClose={() => setDeletingFarmer(null)}
        onConfirm={() => deletingFarmer && deleteMutation.mutate(deletingFarmer.id)}
        title="Delete Farmer"
        description={`Are you sure you want to permanently delete "${deletingFarmer?.full_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
