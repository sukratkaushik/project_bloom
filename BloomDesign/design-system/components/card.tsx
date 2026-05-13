import { HTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

type Tone = 'default' | 'sage' | 'blush' | 'gold' | 'critical';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  /** Apply the canonical premium hover-lift effect */
  hoverLift?: boolean;
}

const tones: Record<Tone, string> = {
  default: 'bg-white border-border',
  sage: 'bg-sage-pale border-sage-pale',
  blush: 'bg-blush-pale border-blush-pale',
  gold: 'bg-gold-pale border-gold-pale',
  critical: 'bg-critical-bg border-critical-bg',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ tone = 'default', hoverLift, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-soft border p-5 shadow-card transition-all duration-base ease-out',
        tones[tone],
        hoverLift && 'hover:-translate-y-1 hover:shadow-card-hover hover:border-sage-light',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';
