import { get, post } from './client';
import type { AuthRequestDto } from './types';

/**
 * Auth endpoints (`POST /api/auth/*`).
 * Authentication uses a server-side session carried by an HttpOnly cookie.
 */
export const authService = {
  async register(email: string, password: string): Promise<string> {
    const body: AuthRequestDto = { email, password };
    return post<string>('/auth/register', body);
  },

  async login(email: string, password: string): Promise<string> {
    const body: AuthRequestDto = { email, password };
    return post<string>('/auth/login', body);
  },

  async logout(): Promise<string> {
    return post<string>('/auth/logout');
  },

  async getSession(): Promise<{ email: string }> {
    return get<{ email: string }>('/auth/session');
  },
};
