import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2)}`;
    return (
      <label htmlFor={checkboxId} className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          id={checkboxId}
          className={cn(
            'h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-2',
            className
          )}
          ref={ref}
          {...props}
        />
        {label && <span className="text-sm text-foreground">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };