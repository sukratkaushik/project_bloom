import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'critical';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-sans font-semibold rounded-pill transition-all duration-base ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96]';

const variants: Record<Variant, string> = {
  primary:
    'bg-sage text-white hover:bg-sage-light hover:text-charcoal',
  secondary:
    'bg-white text-sage border border-sage hover:bg-sage-pale',
  ghost:
    'bg-transparent text-charcoal hover:bg-sage-pale',
  critical:
    'bg-critical text-white hover:opacity-90',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-caption',
  md: 'h-11 px-6 text-body-app',
  lg: 'h-14 px-8 text-body',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...rest}
    />
  )
);
Button.displayName = 'Button';
