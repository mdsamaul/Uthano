import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types';

const ORDER_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'Order Placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'processing', label: 'Processing' },
  { status: 'packed', label: 'Packed' },
  { status: 'out_for_delivery', label: 'Out for Delivery' },
  { status: 'delivered', label: 'Delivered' },
];

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
}

export function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const currentIndex = ORDER_STEPS.findIndex(
    (step) => step.status === currentStatus
  );

  if (currentStatus === 'cancelled') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-sm font-medium text-red-700">Order Cancelled</p>
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {ORDER_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <li key={step.status} className="relative flex gap-3 pb-6 last:pb-0">
            {index < ORDER_STEPS.length - 1 && (
              <div
                className={cn(
                  'absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-0.5',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
              />
            )}

            <div
              className={cn(
                'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                isCompleted && 'border-primary bg-primary',
                isCurrent && 'border-primary bg-primary-light',
                isPending && 'border-border bg-white'
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-white" />
              ) : isCurrent ? (
                <Clock className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Circle className="h-3 w-3 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 pt-0.5">
              <p
                className={cn(
                  'text-sm font-medium',
                  isCompleted && 'text-foreground',
                  isCurrent && 'text-primary',
                  isPending && 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Current status
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}