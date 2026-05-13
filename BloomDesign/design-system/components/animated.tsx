import { HTMLAttributes, ReactNode } from 'react';
import { cn } from './utils';

type Animation = 'fade-in' | 'slide-in' | 'zoom-in';

interface AnimatedProps extends HTMLAttributes<HTMLDivElement> {
  as?: Animation;
  delay?: number;          // ms — pairs well with stagger
  duration?: 'fast' | 'base' | 'slow' | 'entry';
  children: ReactNode;
}

const animMap: Record<Animation, string> = {
  'fade-in':  'animate-fade-in',
  'slide-in': 'animate-slide-in',
  'zoom-in':  'animate-zoom-in',
};

const durationMap = {
  fast: 'duration-fast',
  base: 'duration-base',
  slow: 'duration-slow',
  entry: 'duration-entry',
};

/** Wraps content with the canonical brand entry animations. Respects prefers-reduced-motion. */
export function Animated({ as = 'fade-in', delay = 0, duration = 'entry', className, style, children, ...rest }: AnimatedProps) {
  return (
    <div
      className={cn(animMap[as], durationMap[duration], 'ease-out', className)}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
