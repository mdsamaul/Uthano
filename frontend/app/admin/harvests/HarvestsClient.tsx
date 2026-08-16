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
import { Harvest } from '@/types';
import { Edit, Trash2, Plus } from 'lucide-react';

const HARVEST_STATUS_VARIANTS: Record<string, 'success' | 'secondary' | 'danger' | 'warning'> = {
  RECORDED: 'secondary',
  QUALITY_CHECKED: 'warning',
  BATCHED: 'success',
  REJECTED: 'danger',
};

const HARVEST_STATUS_LABELS: Record<string, string> = {
  RECORDED: 'Recorded',
  QUALITY_CHECKED: 'Quality Checked',
  BATCHED: 'Batched',
  REJECTED: 'Rejected',
};

export function HarvestsClient() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasAdminAccess } = useAccess();
  const { to } = useRolePath();
  const canManage = hasAdminAccess;
  const canDelete = hasAdminAccess;

  const [deletingHarvest, setDeletingHarvest] = useState<Harvest | null>(null);

  const harvestsQuery = useQuery({
    queryKey: ['admin', 'harvests'],
    queryFn: () => adminService.getHarvests(1, 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteHarvest(id),
    onSuccess: () => {
      showToast('Harvest deleted successfully.');
      setDeletingHarvest(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'harvests'] });
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to delete harvest.', 'error'),
  });

  const columns = [
    {
      key: 'farm_name',
      header: 'Farm',
      render: (h: Harvest) => (
        <div>
          <p className="font-medium">{h.farm?.farm_name || '—'}</p>
          <p className="text-xs text-muted-foreground">{h.farm?.farmer?.full_name || ''}</p>
        </div>
      ),
    },
    {
      key: 'product_name',
      header: 'Product',
      render: (h: Harvest) => <span>{h.product?.name || '—'}</span>,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (h: Harvest) => (
        <span>
          {h.actual_quantity} {h.quantity_unit?.symbol || ''}
        </span>
      ),
    },
    {
      key: 'harvest_date',
      header: 'Harvest Date',
      render: (h: Harvest) => <span>{h.harvest_date ? h.harvest_date.split('T')[0] : '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (h: Harvest) => (
        <Badge variant={HARVEST_STATUS_VARIANTS[h.status] ?? 'secondary'}>
          {HARVEST_STATUS_LABELS[h.status] ?? h.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (h: Harvest) => (
        <div className="flex gap-1">
          {canManage && (
            <Link href={to(`/harvests/${h.id}/edit`)}>
              <Button variant="ghost" size="sm" aria-label={`Edit harvest ${h.harvest_code}`}>
                <Edit className="h-3 w-3" />
              </Button>
            </Link>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-danger"
              aria-label={`Delete harvest ${h.harvest_code}`}
              onClick={() => setDeletingHarvest(h)}
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
        <h1 className="text-2xl font-bold">Harvests</h1>
        {canManage && (
          <Link href={to('/harvests/new')}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Harvest
            </Button>
          </Link>
        )}
      </div>

      <Card className="p-4">
        {harvestsQuery.isError ? (
          <ErrorMessage message="Harvests could not be loaded." onRetry={() => harvestsQuery.refetch()} />
        ) : (
          <AdminTable
            columns={columns}
            data={harvestsQuery.data?.items || []}
            isLoading={harvestsQuery.isLoading}
            emptyMessage="No harvests found"
          />
        )}
      </Card>

      <ConfirmDialog
        open={!!deletingHarvest}
        onClose={() => setDeletingHarvest(null)}
        onConfirm={() => deletingHarvest && deleteMutation.mutate(deletingHarvest.id)}
        title="Delete Harvest"
        description={`Are you sure you want to permanently delete "${deletingHarvest?.harvest_code}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
