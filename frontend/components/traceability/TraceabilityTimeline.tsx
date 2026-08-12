import { Sprout, Wheat, Package, ShieldCheck, Home, Truck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

interface TraceabilityStep {
  icon: React.ReactNode;
  title: string;
  description?: string;
  date?: string;
  status: 'completed' | 'current' | 'pending';
}

interface TraceabilityTimelineProps {
  steps: TraceabilityStep[];
}

export function TraceabilityTimeline({ steps }: TraceabilityTimelineProps) {
  return (
    <ol className="relative space-y-6">
      {steps.map((step, index) => (
        <li key={index} className="relative flex gap-4">
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'absolute left-5 top-12 h-[calc(100%-2rem)] w-0.5',
                step.status === 'completed' ? 'bg-primary' : 'bg-border'
              )}
            />
          )}

          {/* Icon */}
          <div
            className={cn(
              'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
              step.status === 'completed' &&
                'border-primary bg-primary-light text-primary',
              step.status === 'current' &&
                'border-primary bg-primary text-white',
              step.status === 'pending' &&
                'border-border bg-muted text-muted-foreground'
            )}
          >
            {step.status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              step.icon
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-2">
            <h3 className="text-sm font-semibold">{step.title}</h3>
            {step.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {step.description}
              </p>
            )}
            {step.date && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(step.date)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export const TRACEABILITY_ICONS = {
  farm: <Sprout className="h-5 w-5" />,
  harvest: <Wheat className="h-5 w-5" />,
  batch: <Package className="h-5 w-5" />,
  quality: <ShieldCheck className="h-5 w-5" />,
  uthano: <Home className="h-5 w-5" />,
  delivery: <Truck className="h-5 w-5" />,
};