'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/common/pagination';
import { ErrorMessage } from '@/components/common/state-components';
import { AuditLog, PaginationMeta } from '@/types';

const EMPTY_META: PaginationMeta = { current_page: 1, last_page: 1, per_page: 20, total: 0, from: 0, to: 0 };

export function AuditLogsClient() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filters, setFilters] = useState<{ action?: string; from?: string; to?: string }>({});

  const query = useQuery({
    queryKey: ['admin', 'audit-logs', page, filters],
    queryFn: () => adminService.getAuditLogs(page, 20, filters),
  });

  const logs = query.data?.items ?? [];
  const meta = query.data?.meta ?? EMPTY_META;

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (l: AuditLog) => l.user ? `${l.user.name}` : 'System',
    },
    { key: 'action', header: 'Action', render: (l: AuditLog) => <span className="font-medium capitalize">{l.action}</span> },
    {
      key: 'auditable_type',
      header: 'Module',
      render: (l: AuditLog) => {
        const modelName = l.auditable_type ? l.auditable_type.split('\\').pop()?.replace(/Model$/i, '') : '—';
        return <span className="text-xs text-muted-foreground">{modelName}</span>;
      },
    },
    { key: 'ip_address', header: 'IP', render: (l: AuditLog) => l.ip_address || '—' },
    {
      key: 'created_at',
      header: 'Time',
      render: (l: AuditLog) => new Date(l.created_at).toLocaleString(),
    },
  ];

  const applyFilters = () => {
    setPage(1);
    setFilters({ action: action || undefined, from: from || undefined, to: to || undefined });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      <Card className="p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Action</label>
            <Input value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g. created, updated" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button
            onClick={applyFilters}
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Filter
          </button>
        </div>

        {query.isError ? (
          <ErrorMessage message="Audit logs could not be loaded." onRetry={() => query.refetch()} />
        ) : (
          <>
            <AdminTable columns={columns} data={logs} isLoading={query.isLoading} emptyMessage="No audit logs found" />
            {meta.total > 0 && <Pagination meta={meta} onPageChange={setPage} className="mt-4" />}
          </>
        )}
      </Card>
    </div>
  );
}