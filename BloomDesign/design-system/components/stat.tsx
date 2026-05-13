interface StatProps {
  value: string;          // "₹5,000" or "1,000+" or "28 wks"
  label: string;
  caption?: string;
}

/** Number + label, used in marketing and dashboard. */
export function Stat({ value, label, caption }: StatProps) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <span className="font-serif text-h2 text-charcoal leading-none">{value}</span>
      <span className="text-body-app font-semibold text-charcoal">{label}</span>
      {caption && <span className="text-caption text-medium">{caption}</span>}
    </div>
  );
}
