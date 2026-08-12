'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { customerService, orderService } from '@/services';
import { useCartStore, useAuthStore, useUIStore } from '@/store';
import { formatBDT } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { addressSchema, AddressFormData } from '@/lib/validations';
import { BANGLADESH_DIVISIONS } from '@/lib/utils';
import { CreateOrderData, PaymentMethod } from '@/types';
import { EmptyState, ErrorMessage } from '@/components/common/state-components';

const STEPS = ['Address', 'Delivery', 'Payment', 'Review'];

export function CheckoutClient() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const subtotal = getSubtotal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      is_default: false,
    },
  });

  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: () => customerService.getAddresses(),
    enabled: isAuthenticated,
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderData) => orderService.createOrder(data),
    onSuccess: (order) => {
      clearCart();
      showToast('Order placed successfully');
      router.push(`/orders/${order.order_number}/success`);
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
      setIsSubmitting(false);
    },
  });

  const handleCreateAddress = handleSubmit(async (data) => {
    try {
      const address = await customerService.createAddress(data);
      setSelectedAddressId(address.id);
      setShowAddressForm(false);
      reset();
      addressesQuery.refetch();
      showToast('Address saved');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save address', 'error');
    }
  });

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setIsSubmitting(true);
    createOrderMutation.mutate({
      address_id: selectedAddressId,
      payment_method: paymentMethod,
      notes: notes || undefined,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    });
  };

  if (items.length === 0 && currentStep === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
        <EmptyState
          title="Your cart is empty"
          description="Add some products before proceeding to checkout"
          action={
            <Button onClick={() => router.push('/products')}>Shop Fresh</Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-2">
            <button
              onClick={() => index < currentStep && setCurrentStep(index)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                index === currentStep
                  ? 'bg-primary text-white'
                  : index < currentStep
                    ? 'bg-primary-light text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span>{index + 1}</span>
              )}
              {step}
            </button>
            {index < STEPS.length - 1 && (
              <div className="h-px w-6 bg-border" />
            )}
          </li>
        ))}
      </ol>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Address
              </h2>

              {!isAuthenticated ? (
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground">
                    Please login to continue with checkout.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() =>
                      router.push(`/auth/login?redirect=${encodeURIComponent('/checkout')}`)
                    }
                  >
                    Login to Continue
                  </Button>
                </Card>
              ) : addressesQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : addressesQuery.isError ? (
                <ErrorMessage
                  message="Addresses could not be loaded."
                  onRetry={() => addressesQuery.refetch()}
                />
              ) : (
                <>
                  {addressesQuery.data && addressesQuery.data.length > 0 && (
                    <div className="space-y-3">
                      {addressesQuery.data.map((address) => (
                        <label
                          key={address.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                            selectedAddressId === address.id
                              ? 'border-primary bg-primary-light/30'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === address.id}
                            onChange={() => setSelectedAddressId(address.id)}
                            className="mt-1 h-4 w-4 text-primary"
                          />
                          <div>
                            <p className="font-medium">
                              {address.name}
                              {address.is_default && (
                                <span className="ml-2 rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary">
                                  Default
                                </span>
                              )}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {address.phone}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {address.address}, {address.area}, {address.upazila},{' '}
                              {address.district}, {address.division}
                              {address.postal_code && ` - ${address.postal_code}`}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {showAddressForm ? (
                    <Card className="p-6">
                      <h3 className="mb-4 font-semibold">Add New Address</h3>
                      <form onSubmit={handleCreateAddress} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Full Name
                            </label>
                            <Input
                              placeholder="Recipient name"
                              error={errors.name?.message}
                              {...register('name')}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Phone
                            </label>
                            <Input
                              placeholder="01XXXXXXXXX"
                              error={errors.phone?.message}
                              {...register('phone')}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Division
                            </label>
                            <Select
                              error={errors.division?.message}
                              {...register('division')}
                            >
                              <option value="">Select Division</option>
                              {BANGLADESH_DIVISIONS.map((division) => (
                                <option key={division} value={division}>
                                  {division}
                                </option>
                              ))}
                            </Select>
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              District
                            </label>
                            <Input
                              placeholder="e.g. Dhaka"
                              error={errors.district?.message}
                              {...register('district')}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Upazila
                            </label>
                            <Input
                              placeholder="e.g. Dhanmondi"
                              error={errors.upazila?.message}
                              {...register('upazila')}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Area
                            </label>
                            <Input
                              placeholder="e.g. Mohammadpur"
                              error={errors.area?.message}
                              {...register('area')}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-medium">
                              Full Address
                            </label>
                            <Textarea
                              placeholder="House, road, area details"
                              error={errors.address?.message}
                              {...register('address')}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Postal Code
                            </label>
                            <Input
                              placeholder="e.g. 1207"
                              error={errors.postal_code?.message}
                              {...register('postal_code')}
                            />
                          </div>
                          <div className="flex items-end pb-2">
                            <Checkbox
                              label="Set as default address"
                              {...register('is_default')}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit">Save Address</Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowAddressForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Card>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowAddressForm(true)}
                    >
                      + Add New Address
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 2: Delivery */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Truck className="h-5 w-5 text-primary" />
                Delivery Information
              </h2>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground">
                  Delivery fee will be calculated by the backend based on your
                  delivery address. Standard delivery typically takes 1-3
                  business days.
                </p>
                <div className="mt-4 rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">Delivery Options</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Standard Delivery - 1-3 business days
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Delivery fee: Calculated at order confirmation
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Method
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-primary-light/30'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="h-4 w-4 text-primary"
                  />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Pay in cash when you receive your order
                    </p>
                  </div>
                </label>

                <div className="rounded-lg border border-border p-4 opacity-50">
                  <p className="font-medium">bKash / Nagad / Card</p>
                  <p className="text-sm text-muted-foreground">
                    Coming soon
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Order Notes (Optional)
                </label>
                <Textarea
                  placeholder="Any special instructions for your delivery"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Review Your Order
              </h2>

              <Card className="p-6">
                <h3 className="font-semibold">Items</h3>
                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {item.product?.name} × {item.quantity}
                      </span>
                      <span className="font-medium">{formatBDT(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {selectedAddressId && addressesQuery.data && (
                <Card className="p-6">
                  <h3 className="font-semibold">Delivery Address</h3>
                  {(() => {
                    const address = addressesQuery.data.find(
                      (a) => a.id === selectedAddressId
                    );
                    if (!address) return null;
                    return (
                      <div className="mt-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{address.name}</p>
                        <p>{address.phone}</p>
                        <p>
                          {address.address}, {address.area}, {address.upazila},{' '}
                          {address.district}, {address.division}
                        </p>
                      </div>
                    );
                  })()}
                </Card>
              )}

              <Card className="p-6">
                <h3 className="font-semibold">Payment</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}
                </p>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={() => {
                  if (currentStep === 0 && !selectedAddressId) {
                    showToast('Please select a delivery address', 'error');
                    return;
                  }
                  setCurrentStep(currentStep + 1);
                }}
              >
                Continue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Items</dt>
                <dd className="font-medium">{formatBDT(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Delivery Fee</dt>
                <dd className="font-medium">Calculated at checkout</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="font-medium">Calculated at checkout</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="text-lg font-bold">{formatBDT(subtotal)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Final delivery fee and total will be confirmed by the backend.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}