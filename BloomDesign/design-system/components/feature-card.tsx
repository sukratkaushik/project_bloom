import { ReactNode } from 'react';
import { Card } from './card';

interface FeatureCardProps {
  icon: ReactNode;            // e.g. an emoji or <HeartIcon />
  title: string;
  description: string;
  comingSoon?: boolean;
}

/** Matches the homepage "Vitals Tracker / Kick Counter / Hospital Bag Checklist" pattern. */
export function FeatureCard({ icon, title, description, comingSoon }: FeatureCardProps) {
  return (
    <Card hoverLift className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-h5 leading-none" aria-hidden>
          {icon}
        </span>
        {comingSoon && (
          <span className="text-overline uppercase tracking-wider font-bold text-gold bg-gold-pale rounded-pill px-2 py-1">
            Coming Soon
          </span>
        )}
      </div>
      <h3 className="font-serif text-h5 text-charcoal">{title}</h3>
      <p className="text-body-app text-medium leading-relaxed">{description}</p>
    </Card>
  );
}
