'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services';
import { useAuth } from '@/hooks/use-auth';
import { useUIStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState, Unauthorized, ErrorMessage } from '@/components/common/state-components';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, AddressFormData } from '@/lib/validations';
import { BANGLADESH_DIVISIONS } from '@/lib/utils';
import { MapPin, Trash2, Star } from 'lucide-react';

export function AddressesClient() {
  const { isAuthenticated, isRestoring } = useAuth();
  const queryClient = useQueryClient();
  const showToast = useUIStore((state) => state.showToast);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { is_default: false },
  });

  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: () => customerService.getAddresses(),
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (data: AddressFormData) => customerService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowForm(false);
      reset();
      showToast('Address saved');
    },
    onError: (error: Error) => showToast(error.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customerService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      showToast('Address deleted');
    },
    onError: (error: Error) => showToast(error.message, 'error'),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => customerService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      showToast('Default address updated');
    },
    onError: (error: Error) => showToast(error.message, 'error'),
  });

  if (isRestoring) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Unauthorized />;

  if (addressesQuery.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (addressesQuery.isError) {
    return (
      <ErrorMessage
        message="Addresses could not be loaded."
        onRetry={() => addressesQuery.refetch()}
      />
    );
  }

  const addresses = addressesQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Saved Addresses</h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Address'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form
            onSubmit={handleSubmit((data) => createMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Full Name</label>
                <Input placeholder="Recipient name" error={errors.name?.message} {...register('name')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <Input placeholder="01XXXXXXXXX" error={errors.phone?.message} {...register('phone')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Division</label>
                <Select error={errors.division?.message} {...register('division')}>
                  <option value="">Select Division</option>
                  {BANGLADESH_DIVISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">District</label>
                <Input placeholder="e.g. Dhaka" error={errors.district?.message} {...register('district')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Upazila</label>
                <Input placeholder="e.g. Dhanmondi" error={errors.upazila?.message} {...register('upazila')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Area</label>
                <Input placeholder="e.g. Mohammadpur" error={errors.area?.message} {...register('area')} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Full Address</label>
                <Textarea placeholder="House, road, area details" error={errors.address_line?.message} {...register('address_line')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Postal Code</label>
                <Input placeholder="e.g. 1207" error={errors.postal_code?.message} {...register('postal_code')} />
              </div>
              <div className="flex items-end pb-2">
                <Checkbox label="Set as default" {...register('is_default')} />
              </div>
            </div>
            <Button type="submit" isLoading={createMutation.isPending}>
              Save Address
            </Button>
          </form>
        </Card>
      )}

      {addresses.length === 0 && !showForm ? (
        <EmptyState
          title="No addresses saved"
          description="Add a delivery address to get started"
          icon={<MapPin className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <Card key={address.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {address.name}
                    {address.is_default && (
                      <span className="ml-2 rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{address.phone}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {address.address_line}, {address.area}, {address.upazila}, {address.district}, {address.division}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!address.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefaultMutation.mutate(address.id)}
                    >
                      <Star className="mr-1 h-3 w-3" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-red-50"
                    onClick={() => deleteMutation.mutate(address.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}