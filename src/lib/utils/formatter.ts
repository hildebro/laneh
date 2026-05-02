import { getLocale } from '$lib/paraglide/runtime.js';

export const priceFormatter = new Intl.NumberFormat(getLocale(), {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2
});

export const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric'
});

export const shortDateFormatter = new Intl.DateTimeFormat(getLocale(), {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});
