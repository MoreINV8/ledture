import type { ComponentProps } from 'react';
import TransactionList from '../components/TransactionList';

/**
 * Page-level wrapper for the Transaction List.
 * Props are passed through to the component; in a full app you might fetch
 * data via context or a router.
 */
const TransactionListPage = (props: ComponentProps<typeof TransactionList>) => {
  return <TransactionList {...props} />;
};

export default TransactionListPage;
