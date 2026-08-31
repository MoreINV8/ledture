/* ============================================================================
 * DTO shapes that mirror the Spring Boot backend controllers
 * (`backend/src/main/java/com/moreinv8/github/backend/controller/*`).
 * These are the raw wire formats; convert them with `mappers.ts` before use.
 * ========================================================================== */

export type ApiType = 'I' | 'E';

/* ------------------------------ Auth (plain strings) ------------------------------ */
export interface AuthRequestDto {
  email: string;
  password: string;
}

/* ------------------------------- Categories ------------------------------- */
export interface CategoryDto {
  id: string;
  label: string;
  emoji: string;
}

/* ------------------------------ Transactions ------------------------------ */
export interface TransactionDto {
  id: string;
  /** BigDecimal serialized as a JSON number. */
  amount: number;
  type: ApiType;
  /** LocalDate serialized as `yyyy-MM-dd`. */
  transactionDate: string;
  note: string | null;
  userId: string;
  categoryId: string | null;
}

/** Request body for `POST /api/transactions` and `PUT /api/transactions/{id}`. */
export interface TransactionRequestDto {
  amount: number;
  type: ApiType;
  transactionDate: string;
  note: string | null;
  categoryId: string | null;
}

/** Query params for `GET /api/transactions`. */
export interface TransactionQuery {
  year?: number;
  month?: number;
  date?: number;
}

/* ------------------------- Error payload from backend ------------------------- */
export interface ErrorPayloadDto {
  error: string;
  message: string;
}
