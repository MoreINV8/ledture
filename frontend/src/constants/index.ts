import type { Category, User } from '../types';

/* ------------------------------- App identity ------------------------------- */
export const APP_NAME = 'Ledture';
export const APP_TAGLINE = 'Ledger for Future';

export const DEFAULT_USER: User = {
  id: 'usr_892113',
  email: 'alex.investor@ledture.app',
  isAuthenticated: true,
  sessionExpires: '7 days remaining',
};

/* ----------------------- Ledture 7-Day Business Rule ----------------------- */
/** A record older than this many days is permanently locked for modification. */
export const MAX_EDITABLE_DAYS = 7;
/** Records may be back-dated no further than this many days. */
export const MAX_FUTURE_DAYS = 365;

/* -------------------------------- Categories -------------------------------- */
export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', label: 'Food & Dining', icon: '🍔', type: 'E' },
  { id: 'cat-2', label: 'Transportation', icon: '🚗', type: 'E' },
  { id: 'cat-3', label: 'Shopping', icon: '🛍️', type: 'E' },
  { id: 'cat-4', label: 'Bills & Utilities', icon: '💡', type: 'E' },
  { id: 'cat-5', label: 'Entertainment', icon: '🎬', type: 'E' },
  { id: 'cat-6', label: 'Healthcare', icon: '🩺', type: 'E' },
  { id: 'cat-7', label: 'Salary', icon: '💼', type: 'I' },
  { id: 'cat-8', label: 'Freelance & Side Business', icon: '💻', type: 'I' },
  { id: 'cat-9', label: 'Investments & Dividends', icon: '📈', type: 'I' },
  { id: 'cat-10', label: 'Gifts & Bonus', icon: '🎁', type: 'I' },
];

/* ------------------------------ Form presets ------------------------------ */
export const PRESET_AMOUNTS = [10, 20, 50, 100] as const;
export const PRESET_NEGATIVE_AMOUNTS = [1, 2, 5] as const;
export const YEARLY_RANGE_OPTIONS = [3, 5, 10] as const;

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;
