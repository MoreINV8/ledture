/**
 * Minimal fetch wrapper for the Ledture backend.
 *
 * - Resolves to the parsed JSON body (or `undefined` for 204 responses).
 * - Throws {@link ApiError} with a normalized `{ status, code, message }`
 *   shape, parsing the backend's `{ error, message }` payload or a plain
 *   string body (auth endpoints return e.g. `"REGISTERED"`).
 */

/** Backend base URL. Override with `VITE_API_BASE_URL`, defaults to the Vite proxy. */
export const API_BASE_URL: string =
  (import.meta.env.VITE_BACKEND_API_URL as string | undefined) ?? '/api';

export interface ApiErrorPayload {
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly payload: ApiErrorPayload | null;

  constructor(status: number, code: string, message: string, payload: ApiErrorPayload | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

const parseBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text; // plain string body, e.g. "REGISTERED"
  }
};

const buildError = (status: number, body: unknown): ApiError => {
  if (typeof body === 'string') {
    return new ApiError(status, body, body);
  }
  if (body && typeof body === 'object') {
    const payload = body as ApiErrorPayload;
    return new ApiError(status, payload.error ?? 'API_ERROR', payload.message ?? `Request failed (${status}).`, payload);
  }
  return new ApiError(status, 'API_ERROR', `Request failed (${status}).`);
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { body, headers, ...rest } = options;

  const init: RequestInit = {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, init);

  if (!response.ok) {
    const bodyData = await parseBody(response);
    throw buildError(response.status, bodyData);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await parseBody(response)) as T;
};

export const get = <T>(path: string, options?: RequestOptions): Promise<T> =>
  request<T>(path, { method: 'GET', ...options });

export const post = <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
  request<T>(path, { method: 'POST', body, ...options });

export const put = <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
  request<T>(path, { method: 'PUT', body, ...options });

export const del = <T = void>(path: string, options?: RequestOptions): Promise<T> =>
  request<T>(path, { method: 'DELETE', ...options });
