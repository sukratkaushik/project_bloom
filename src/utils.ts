export function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addWeeks(d: Date, w: number) {
  return addDays(d, w * 7);
}

export function fmtLong(d: Date | string | null) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtShort(d: Date | string | null) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function fmtDay(d: Date | string | null) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { day: 'numeric' });
}

export function fmtMonth(d: Date | string | null) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { month: 'short' });
}
