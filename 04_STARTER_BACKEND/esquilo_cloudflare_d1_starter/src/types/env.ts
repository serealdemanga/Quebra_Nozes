export interface Env {
  DB: D1Database;
  // Wrangler assets binding (SPA build output em /public).
  ASSETS?: Fetcher;
  APP_ENV: string;
  API_VERSION: string;
  APPS_SCRIPT_RECOVERY_URL?: string;
  APPS_SCRIPT_RECOVERY_SECRET?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
}
