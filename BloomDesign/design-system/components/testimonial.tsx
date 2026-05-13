import { Card } from './card';

interface TestimonialProps {
  quote: string;
  name: string;
  initial: string;       // single uppercase letter avatar — "P" for Priya
  location: string;
}

/** Matches the "Trusted by Indian mothers" quote card pattern. */
export function Testimonial({ quote, name, initial, location }: TestimonialProps) {
  return (
    <Card tone="default" className="flex flex-col gap-4">
      <span aria-hidden className="text-h3 font-serif text-sage-light leading-none">"</span>
      <p className="text-body text-charcoal leading-relaxed italic">{quote}</p>
      <div className="flex items-center gap-3 pt-2">
        <span
          aria-hidden
          className="h-10 w-10 rounded-circle bg-sage-pale text-sage flex items-center justify-center font-serif text-h6 font-medium"
        >
          {initial}
        </span>
        <div className="flex flex-col">
          <span className="text-body-app font-semibold text-charcoal">{name}</span>
          <span className="text-caption text-medium">{location}</span>
        </div>
      </div>
    </Card>
  );
}
