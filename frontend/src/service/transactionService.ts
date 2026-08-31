import { del, get, post, put } from './client';
import type { Transaction } from '../types';
import { mapTransaction, mapTransactions, toTransactionRequest } from './mappers';
import type { TransactionDto, TransactionQuery, TransactionRequestDto } from './types';

const buildQuery = (query?: TransactionQuery): string => {
  if (!query) return '';
  const params = new URLSearchParams();
  if (query.year !== undefined) params.set('year', String(query.year));
  if (query.month !== undefined) params.set('month', String(query.month));
  if (query.date !== undefined) params.set('date', String(query.date));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

/** Transaction endpoints (`/api/transactions`). */
export const transactionService = {
  /** List the current user's transactions, optionally filtered by year/month/day. */
  async list(query?: TransactionQuery): Promise<Transaction[]> {
    const dtos = await get<TransactionDto[]>(`/transactions${buildQuery(query)}`);
    return mapTransactions(dtos);
  },

  /** List the newest transactions for the Quick Note activity feed. */
  async listRecent(limit = 3): Promise<Transaction[]> {
    const safeLimit = Math.max(1, Math.min(limit, 20));
    const dtos = await get<TransactionDto[]>(`/transactions/recent?limit=${safeLimit}`);
    return mapTransactions(dtos);
  },

  async get(id: string): Promise<Transaction> {
    const dto = await get<TransactionDto>(`/transactions/${id}`);
    return mapTransaction(dto);
  },

  async create(input: TransactionRequestDto): Promise<Transaction> {
    const dto = await post<TransactionDto>('/transactions', input);
    return mapTransaction(dto);
  },

  async update(id: string, input: TransactionRequestDto): Promise<Transaction> {
    const dto = await put<TransactionDto>(`/transactions/${id}`, input);
    return mapTransaction(dto);
  },

  async remove(id: string): Promise<void> {
    await del(`/transactions/${id}`);
  },
};

/** Convenience re-export so pages can build request payloads without importing mappers directly. */
export { toTransactionRequest };
