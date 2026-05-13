import { ReactNode } from 'react';
import { Button } from './button';

interface HeroProps {
  eyebrow?: string;             // e.g. "New: Cloud Sync Available"
  title: ReactNode;             // Allows <span class="italic"> for emphasis
  subtitle?: string;
  primaryCta: { label: string; href?: string; onClick?: () => void };
  secondaryCta?: { label: string; href?: string; onClick?: () => void };
  tertiaryLink?: { label: string; href?: string };
}

/** Marketing hero matching the live ourpregnancy.in pattern. */
export function Hero({ eyebrow, title, subtitle, primaryCta, secondaryCta, tertiaryLink }: HeroProps) {
  return (
    <section className="bg-cream py-10 sm:py-11 px-6">
      <div className="mx-auto max-w-[880px] flex flex-col items-center text-center gap-6 animate-fade-in">
        {eyebrow && (
          <span className="text-overline uppercase tracking-wider font-bold text-sage bg-sage-pale rounded-pill px-3 py-1.5">
            {eyebrow}
          </span>
        )}
        <h1 className="font-serif text-h1 sm:text-display text-charcoal leading-tight max-w-[18ch]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-large text-medium max-w-[60ch] leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={primaryCta.onClick}
            {...(primaryCta.href ? { as: 'a', href: primaryCta.href } as any : {})}
          >
            {primaryCta.label}
          </Button>
          {secondaryCta && (
            <Button
              variant="secondary"
              size="lg"
              onClick={secondaryCta.onClick}
              {...(secondaryCta.href ? { as: 'a', href: secondaryCta.href } as any : {})}
            >
              {secondaryCta.label}
            </Button>
          )}
        </div>
        {tertiaryLink && (
          <a
            href={tertiaryLink.href}
            className="text-body-app text-medium hover:text-sage transition-colors duration-fast underline decoration-dotted underline-offset-4"
          >
            {tertiaryLink.label}
          </a>
        )}
      </div>
    </section>
  );
}
