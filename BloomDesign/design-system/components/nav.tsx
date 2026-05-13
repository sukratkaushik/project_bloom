import { ReactNode } from 'react';
import { cn } from './utils';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  count?: string;          // e.g. "0/14" — matches the planning page nav
  onClick?: () => void;
  href?: string;
}

/** Matches the dashboard left-nav row. */
export function NavItem({ icon, label, active, count, onClick, href }: NavItemProps) {
  const Tag = href ? 'a' : 'button';
  return (
    // @ts-expect-error — polymorphic
    <Tag
      href={href}
      onClick={onClick}
      className={cn(
        'group flex items-center justify-between w-full gap-3 px-4 py-3 rounded-md text-body-app transition-colors duration-base ease-soft',
        active
          ? 'bg-sage-pale text-charcoal font-semibold'
          : 'text-medium hover:bg-sage-pale/50 hover:text-charcoal'
      )}
    >
      <span className="flex items-center gap-3">
        <span aria-hidden>{icon}</span>
        <span>{label}</span>
      </span>
      {count && (
        <span className="text-caption text-medium">{count}</span>
      )}
    </Tag>
  );
}

interface NavSectionProps {
  title: string;
  children: ReactNode;
}

export function NavSection({ title, children }: NavSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="px-4 py-2 text-overline uppercase tracking-wider font-bold text-light">
        {title}
      </div>
      {children}
    </div>
  );
}
