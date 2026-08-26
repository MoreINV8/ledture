import type { ComponentProps } from 'react';
import QuickNote from '../components/QuickNote';

/**
 * Page-level wrapper for the QuickNote component.
 * It receives the same props as QuickNote; in a real routing setup you would
 * provide the required state here or fetch it via context.
 */
const QuickNotePage = (props: ComponentProps<typeof QuickNote>) => {
  return <QuickNote {...props} />;
};

export default QuickNotePage;
