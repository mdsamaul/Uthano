'use client';

import { useMemo, useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { AdminTable } from '@/components/admin/AdminTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/common/pagination';
import { ErrorMessage } from '@/components/common/state-components';
import { useUIStore } from '@/store';
import { useAccess } from '@/hooks/use-access';
import { Customer, PaginationMeta } from '@/types';
import { ArrowLeft, UserPlus } from 'lucide-react';

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
  from: 0,
  to: 0,
};

export function CustomersClient() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const { hasPermission } = useAccess();
  const canManage = hasPermission('customer.view');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const customersQuery = useQuery({
    queryKey: ['admin', 'customers', page, debouncedSearch],
    queryFn: () => adminService.getCustomers(page, 20, debouncedSearch || undefined),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });

  const createMutation = useMutation({
    mutationFn: (data: { full_name: string; phone: string }) => adminService.createCustomer(data),
    onSuccess: () => {
      showToast('Customer created successfully.');
      setShowForm(false);
      invalidate();
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Unable to create customer.', 'error'),
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  const handleCancelForm = () => setShowForm(false);
const columns = useMemo(() => [
    {
      key: 'full_name',
      header: 'Name',
      render: (c: Customer) => <span className="font-medium">{c.full_name ?? c.name ?? '—'}</span>,
    },
    { key: 'phone', header: 'Phone' },
    { key: 'customer_code', header: 'Customer Code', render: (c: Customer) => c.customer_code ?? '—' },
    {
      key: 'status',
      header: 'Status',
      render: (c: Customer) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {(c.status ?? 'active').replace(/_/g, ' ')}
        </span>
      ),
    },
    { key: 'created_at', header: 'Created', render: (c: Customer) => new Date(c.created_at).toLocaleDateString() },
  ], []);

  const meta = customersQuery.data?.meta ?? EMPTY_META;
  const customers = customersQuery.data?.items ?? [];
  const error = customersQuery.error;

  if (error) {
    return <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load customers'} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage store customers. Customers log in with their phone number + OTP.
          </p>
        </div>
        {canManage && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        )}
      </div>

      {showForm ? (
        <Card className="p-6">
          <div className="mb-6">
            <Button variant="outline" onClick={handleCancelForm} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
            <h2 className="text-xl font-semibold">Add New Customer</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a customer with just a name and phone number. They can then log in with an OTP on that phone.
            </p>
          </div>
          <CustomerForm
            submitting={createMutation.isPending}
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={handleCancelForm}
          />
        </Card>
      ) : (
        <>
          <Card className="p-4">
            <div className="relative max-w-sm">
              <Input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, phone or code..."
                className="pl-9"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </Card>

          <Card>
            <AdminTable
              columns={columns}
              data={customers}
              isLoading={customersQuery.isPending}
              emptyMessage="No customers found."
            />
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Showing {meta.from ?? 0} to {meta.to ?? 0} of {meta.total ?? 0} customers
              </span>
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
function CustomerForm({
  submitting,
  onSubmit,
  onCancel,
}: {
  submitting: boolean;
  onSubmit: (data: { full_name: string; phone: string }) => void;
  onCancel: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.full_name = 'Name is required';
    if (!phone.trim()) next.phone = 'Phone number is required';
    else if (!/^[0-9+\-\s]{8,20}$/.test(phone.trim())) next.phone = 'Enter a valid phone number (e.g. 01712345678)';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      full_name: fullName.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Full Name</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Customer full name"
            error={errors.full_name}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone Number</label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01712345678"
            error={errors.phone}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        This customer will be able to log in to the store with this phone number using an OTP code — no email or
        password required.
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          {submitting ? 'Creating...' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}
}