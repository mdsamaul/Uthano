'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Address } from '@/types';
import { customerService } from '@/services/customer.service';
import { addressSchema } from '@/lib/validations';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  isEditing?: boolean;
  initialAddress?: Address;
  onSuccess?: (address: Address) => void;
}

export function AddressForm({
  isEditing = false,
  initialAddress,
  onSuccess,
}: AddressFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = isEditing ? addressSchema.partial() : addressSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
    reset,
  } = useForm<AddressFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialAddress
      ? {
          name: initialAddress.name,
          phone: initialAddress.phone,
          division: initialAddress.division,
          district: initialAddress.district,
          upazila: initialAddress.upazila,
          area: initialAddress.area,
          address_line: initialAddress.address_line,
          postal_code: initialAddress.postal_code,
          is_default: initialAddress.is_default,
        }
      : { is_default: false },
  });

  const onSubmit = async (data: AddressFormValues) => {
    setIsSubmitting(true);

    try {
      let address: Address;

      if (isEditing && initialAddress) {
        address = await customerService.updateAddress(initialAddress.id, data);
      } else {
        address = await customerService.createAddress(data);
      }

      alert(isEditing ? 'Address updated successfully!' : 'Address added successfully!');

      if (onSuccess) {
        onSuccess(address);
      }

      reset();
      setIsSubmitting(false);

      if (!isEditing) {
        router.push('/');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save address');
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit Address' : 'Add New Address'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            placeholder="e.g. Home, Office, etc."
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Phone
          </label>
          <Input
            id="phone"
            placeholder="01XXXXXXXXX"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="division" className="mb-1 block text-sm font-medium">
              Division
            </label>
            <Select id="division" {...register('division')}>
              <option value="">Select division</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Khulna">Khulna</option>
              <option value="Barisal">Barisal</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Rangpur">Rangpur</option>
              <option value="Mymensingh">Mymensingh</option>
            </Select>
          </div>

          <div>
            <label htmlFor="district" className="mb-1 block text-sm font-medium">
              District
            </label>
            <Select id="district" {...register('district')}>
              <option value="">Select district</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Gazipur">Gazipur</option>
              <option value="Narayanganj">Narayanganj</option>
              <option value="Comilla">Comilla</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Khulna">Khulna</option>
              <option value="Barisal">Barisal</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Rangpur">Rangpur</option>
              <option value="Mymensingh">Mymensingh</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="upazila" className="mb-1 block text-sm font-medium">
              Upazila
            </label>
            <Select id="upazila" {...register('upazila')}>
              <option value="">Select upazila</option>
              <option value="Dhamrai">Dhamrai</option>
              <option value="Savar">Savar</option>
              <option value="Keraniganj">Keraniganj</option>
              <option value="Dohar">Dohar</option>
            </Select>
          </div>

          <div>
            <label htmlFor="area" className="mb-1 block text-sm font-medium">
              Area/Neighborhood
            </label>
            <Input
              id="area"
              placeholder="e.g. Gulshan, Dhanmondi, etc."
              {...register('area')}
              error={errors.area?.message}
            />
          </div>
        </div>

        <div>
          <label htmlFor="address_line" className="mb-1 block text-sm font-medium">
            Full Address
          </label>
          <Input
            id="address_line"
            placeholder="Street address, house number, etc."
            {...register('address_line')}
            error={errors.address_line?.message}
          />
        </div>

        <div>
          <label htmlFor="postal_code" className="mb-1 block text-sm font-medium">
            Postal Code (optional)
          </label>
          <Input
            id="postal_code"
            placeholder="e.g. 1212"
            type="text"
            {...register('postal_code')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Button type="submit" disabled={isSubmitting || formIsSubmitting}>
            {isSubmitting || formIsSubmitting
              ? 'Saving...'
              : isEditing
                ? 'Update Address'
                : 'Save Address'}
          </Button>

          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reset();
                router.push('/');
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}