export interface Env {
  DB: D1Database;
  APP_ENV: string;
  API_VERSION: string;
  APPS_SCRIPT_RECOVERY_URL?: string;
  APPS_SCRIPT_RECOVERY_SECRET?: string;
}
