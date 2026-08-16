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
import { AdminFarm } from '@/types';
import { Edit, Trash2, Plus } from 'lucide-react';

const FARM_STATUS_VARIANTS: Record<string, 'success' | 'secondary' | 'danger'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  SUSPENDED: 'danger',
};

export const FARM_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

const VERIFICATION_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  VERIFIED: 'success',
  PENDING: 'warning',
  REJECTED: 'danger',
};

export const VERIFICATION_LABELS: Record<string, string> = {
  VERIFIED: 'Verified',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
};

export function FarmsClient() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasAdminAccess } = useAccess();
  const { to } = useRolePath();
  const canManage = hasAdminAccess;
  const canDelete = hasAdminAccess;

  const [deletingFarm, setDeletingFarm] = useState<AdminFarm | null>(null);

  const farmsQuery = useQuery({
    queryKey: ['admin', 'farms'],
    queryFn: () => adminService.getFarms(1, 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteFarm(id),
    onSuccess: () => {
      showToast('Farm deleted successfully.');
      setDeletingFarm(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'farms'] });
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to delete farm.', 'error'),
  });

  const columns = [
{
      key: 'farm_name',
      header: 'Farm',
      render: (f: AdminFarm) => (
        <div>
          <p className="font-medium">{f.farm_name}</p>
          <p className="text-xs text-muted-foreground">{f.farm_code}</p>
        </div>
      ),
    },
    {
      key: 'farmer',
      header: 'Farmer',
      render: (f: AdminFarm) =>
        f.farmer ? (
          <div>
            <p className="text-sm font-medium">{f.farmer.full_name}</p>
            <p className="text-xs text-muted-foreground">{f.farmer.farmer_code}</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'district',
      header: 'Location',
      render: (f: AdminFarm) => (
        <div>
          <p className="text-sm">{f.district}</p>
          <p className="text-xs text-muted-foreground">
            {[f.upazila, f.village].filter(Boolean).join(' · ') || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'land_area',
      header: 'Land Area',
      render: (f: AdminFarm) =>
        f.land_area != null ? (
          <span>
            {f.land_area} {f.land_area_unit || ''}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (f: AdminFarm) => (
        <Badge variant={FARM_STATUS_VARIANTS[f.status] ?? 'secondary'}>
          {FARM_STATUS_LABELS[f.status] ?? f.status}
        </Badge>
      ),
    },
    {
      key: 'verification_status',
      header: 'Verification',
      render: (f: AdminFarm) => (
        <Badge variant={VERIFICATION_VARIANTS[f.verification_status] ?? 'secondary'}>
          {VERIFICATION_LABELS[f.verification_status] ?? f.verification_status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (f: AdminFarm) => (
        <div className="flex gap-1">
          {canManage && (
            <Link href={to(`/farms/${f.id}/edit`)}>
              <Button variant="ghost" size="sm" aria-label={`Edit ${f.farm_name}`}>
                <Edit className="h-3 w-3" />
              </Button>
            </Link>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-danger"
              aria-label={`Delete ${f.farm_name}`}
              onClick={() => setDeletingFarm(f)}
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
        <h1 className="text-2xl font-bold">Farms</h1>
        {canManage && (
          <Link href={to('/farms/new')}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Farm
            </Button>
          </Link>
        )}
      </div>

      <Card className="p-4">
        {farmsQuery.isError ? (
          <ErrorMessage message="Farms could not be loaded." onRetry={() => farmsQuery.refetch()} />
        ) : (
          <AdminTable
            columns={columns}
            data={farmsQuery.data?.items || []}
            isLoading={farmsQuery.isLoading}
            emptyMessage="No farms found"
          />
        )}
      </Card>

      <ConfirmDialog
        open={!!deletingFarm}
        onClose={() => setDeletingFarm(null)}
        onConfirm={() => deletingFarm && deleteMutation.mutate(deletingFarm.id)}
        title="Delete Farm"
        description={`Are you sure you want to permanently delete "${deletingFarm?.farm_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
