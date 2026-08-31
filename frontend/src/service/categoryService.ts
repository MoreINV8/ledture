import { get } from './client';
import type { Category } from '../types';
import { mapCategories } from './mappers';
import type { CategoryDto } from './types';

/** Category endpoints (`GET /api/categories`). */
export const categoryService = {
  /**
   * Fetch all categories, using the backend emoji and enriching the response
   * with the frontend's category transaction type metadata.
   */
  async listCategories(): Promise<Category[]> {
    const dtos = await get<CategoryDto[]>('/categories');
    return mapCategories(dtos);
  },
};
