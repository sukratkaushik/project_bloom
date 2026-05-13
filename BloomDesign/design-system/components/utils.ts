// Minimal cn() — concatenates truthy class strings.
// Swap with clsx / tailwind-merge if you already have those.
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
