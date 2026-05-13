import { HTMLAttributes } from 'react';
import { cn } from './utils';

type Variant = 'critical' | 'optional' | 'partner' | 'nice-to-have' | 'success' | 'milestone';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: Variant;
}

const variants: Record<Variant, string> = {
  critical: 'bg-critical-bg text-critical',
  optional: 'bg-gold-pale text-gold',
  partner: 'bg-blush-pale text-blush',
  'nice-to-have': 'bg-gold-pale text-gold',
  success: 'bg-sage-pale text-sage',
  milestone: 'bg-blush-pale text-blush',
};

const labels: Record<Variant, string> = {
  critical: 'CRITICAL',
  optional: 'OPTIONAL',
  partner: 'PARTNER',
  'nice-to-have': 'NICE TO HAVE',
  success: 'COMPLETE',
  milestone: 'MILESTONE',
};

/** Matches the planning page badges: CRITICAL / OPTIONAL / PARTNER / NICE TO HAVE. */
export function Badge({ variant, children, className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-overline font-bold uppercase tracking-wider rounded-pill px-2.5 py-1',
        variants[variant],
        className
      )}
      {...rest}
    >
      {children ?? labels[variant]}
    </span>
  );
}
