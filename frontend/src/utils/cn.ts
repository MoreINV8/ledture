import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names, resolving conflicts deterministically
 * (later classes win over earlier ones).
 */
export const cn = (
  ...classes: Array<string | false | null | undefined>
): string => twMerge(classes.filter(Boolean).join(' '));
