import { post } from './client';
import type { AuthRequestDto } from './types';

/**
 * Auth endpoints (`POST /api/auth/*`).
 * The backend is a placeholder: it returns plain string messages
 * ("REGISTERED", "LOGGED_IN", "LOGGED_OUT") and does not yet issue a
 * session/JWT, so these methods resolve to those strings.
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
};
