import { MAX_EDITABLE_DAYS, MAX_FUTURE_DAYS } from '../constants';

/** Format a date object or string into local `YYYY-MM-DD`. */
export const formatDateString = (dateObj: Date | string): string => {
  const d = new Date(dateObj);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

export const getMinimumRuleDate = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() - MAX_EDITABLE_DAYS);
  return date;
}

/** Difference in full calendar days between today and a target date. */
export const getDaysDifferenceFromToday = (targetDateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - target.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/** Ledture 7-Day Business Rule: records within 7 days may be edited. */
export const isWithin7DaysRule = (targetDateStr: string): boolean => {
  const daysAgo = getDaysDifferenceFromToday(targetDateStr);
  return daysAgo <= MAX_EDITABLE_DAYS && daysAgo >= -MAX_FUTURE_DAYS;
};

/** Shift a `YYYY-MM-DD` string by a number of calendar days. */
export const shiftDate = (dateStr: string, days: number): string => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return formatDateString(d);
};
