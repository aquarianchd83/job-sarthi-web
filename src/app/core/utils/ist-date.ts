const IST = 'Asia/Kolkata';

/** API sends UTC. If the string has no zone suffix, treat it as UTC (never as local). */
export function parseUtc(value: string): Date {
  return new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : value + 'Z');
}

export function formatIst(value: string | null | undefined): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST, day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(parseUtc(value)) + ' IST';
}