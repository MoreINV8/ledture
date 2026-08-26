/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional base URL for the Ledture backend API (defaults to `/api` via the Vite dev proxy). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
