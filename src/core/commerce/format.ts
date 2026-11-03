const cache = new Map<string, Intl.NumberFormat>();

/** Whole amounts render without decimals ($48); fractional amounts always show two ($19.30). */
export function formatMoney(amount: number, currency = "USD", locale = "en-US") {
  const whole = Math.round(amount * 100) % 100 === 0;
  const k = `${locale}|${currency}|${whole}`;
  let f = cache.get(k);
  if (!f) {
    f = new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 });
    cache.set(k, f);
  }
  return f.format(amount);
}

export function formatDate(iso: string, locale = "en-US", opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString(locale, opts);
}
