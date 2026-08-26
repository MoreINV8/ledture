import type { FC } from 'react';
import Summary, { type SummaryProps } from '../components/Summary';

/**
 * Page-level wrapper for the Summary component.
 * In a full app you would supply the required data and state here or via context.
 */
const SummaryPage: FC<SummaryProps> = (props) => {
  return <Summary {...props} />;
};

export default SummaryPage;
