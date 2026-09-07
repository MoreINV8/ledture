import type { Category, Transaction } from '../types';
import type { CategoryDto, TransactionDto, TransactionRequestDto } from './types';

const DEFAULT_CATEGORY_ICON = '🏷️';
/** Map the backend category DTO to the UI shape. */
export const mapCategory = (dto: CategoryDto): Category => ({
  id: dto.id,
  label: dto.label,
  icon: dto.emoji || DEFAULT_CATEGORY_ICON,
  type: dto.type,
});

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
