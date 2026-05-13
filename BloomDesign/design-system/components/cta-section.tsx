import { ReactNode } from 'react';
import { Button } from './button';

interface CtaSectionProps {
  title: ReactNode;
  subtitle?: string;
  cta: { label: string; href?: string; onClick?: () => void };
}

/** Full-width Sage-pale CTA section, matching the "No hidden costs" homepage block. */
export function CtaSection({ title, subtitle, cta }: CtaSectionProps) {
  return (
    <section className="bg-sage-pale py-10 px-6">
      <div className="mx-auto max-w-[720px] flex flex-col items-center text-center gap-5">
        <h2 className="font-serif text-h2 text-charcoal">{title}</h2>
        {subtitle && <p className="text-large text-medium max-w-[55ch]">{subtitle}</p>}
        <Button
          variant="primary"
          size="lg"
          onClick={cta.onClick}
          {...(cta.href ? { as: 'a', href: cta.href } as any : {})}
        >
          {cta.label}
        </Button>
      </div>
    </section>
  );
}
