import { get } from './client';
import type { Category } from '../types';
import { mapCategories } from './mappers';
import type { CategoryDto } from './types';

/** Category endpoints (`GET /api/categories`). */
export const categoryService = {
  /** Fetch all categories, including their backend-defined transaction type. */
  async listCategories(): Promise<Category[]> {
    const dtos = await get<CategoryDto[]>('/categories');
    return mapCategories(dtos);
  },
};
