import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps {
  className?: string;
  children: ReactNode;
}

/** Base panel container used across the app's surfaces. */
export const Card = ({ className, children }: CardProps) => (
  <div className={cn('bg-slate-900 border border-slate-800 rounded-2xl shadow-xl', className)}>
    {children}
  </div>
);
