export interface FormatCurrencyOptions {
  /** Prepend `+` for non-negative values. Defaults to `true`. */
  sign?: boolean;
  /** Number of decimals. Defaults to `2`. */
  decimals?: number;
}

/** Format a number as a baht currency string, e.g. `+฿45.50`, `-฿12.00`. */
export const formatCurrency = (
  amount: number,
  { sign = true, decimals = 2 }: FormatCurrencyOptions = {},
): string => {
  const value = Math.abs(amount).toFixed(decimals);
  const prefix = amount >= 0 ? (sign ? '+' : '') : '-';
  return `${prefix}฿${value}`;
};

/** Format a value as a percentage string, e.g. `42.5%`. */
export const formatPercent = (value: number, decimals = 1): string =>
  `${value.toFixed(decimals)}%`;
