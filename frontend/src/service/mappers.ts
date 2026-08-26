import type { Category, Transaction } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import type { CategoryDto, TransactionDto, TransactionRequestDto } from './types';

const DEFAULT_CATEGORY_ICON = '🏷️';
const DEFAULT_CATEGORY_TYPE = 'E';

/**
 * Map a backend category DTO (`{ id, label }`) to the UI `Category` shape.
 * The backend only stores an id + label, so the icon and income/expense type
 * are recovered from the known local categories by label, falling back to
 * sensible defaults for unknown categories.
 */
export const mapCategory = (dto: CategoryDto): Category => {
  const known = INITIAL_CATEGORIES.find(
    (c) => c.label.toLowerCase() === dto.label.toLowerCase(),
  );
  return {
    id: dto.id,
    label: dto.label,
    icon: known?.icon ?? DEFAULT_CATEGORY_ICON,
    type: known?.type ?? DEFAULT_CATEGORY_TYPE,
  };
};

export const mapCategories = (dtos: CategoryDto[]): Category[] => dtos.map(mapCategory);

/**
 * Map a backend transaction DTO to the UI `Transaction` shape.
 * The backend does not expose `createdAt`, so it maps to an empty string
 * (the field is only used by the local demo data generator).
 */
export const mapTransaction = (dto: TransactionDto): Transaction => ({
  id: dto.id,
  amount: dto.amount,
  type: dto.type,
  transactionDate: dto.transactionDate,
  categoryId: dto.categoryId,
  note: dto.note,
  createdAt: '',
});

export const mapTransactions = (dtos: TransactionDto[]): Transaction[] => dtos.map(mapTransaction);

/** Build the request body for `POST` / `PUT /api/transactions` from a UI transaction. */
export const toTransactionRequest = (tx: Transaction): TransactionRequestDto => ({
  amount: tx.amount,
  type: tx.type,
  transactionDate: tx.transactionDate,
  note: tx.note,
  categoryId: tx.categoryId,
});
