import type { Env } from '../types/env';
import {
  findFreshExternalReferenceCacheByKey,
  upsertExternalReferenceCache,
  getExternalReferencesCacheHealth
} from '../repositories/external_reference_cache_repository';

export type ExternalReferencesServiceStatus = 'disabled' | 'degraded' | 'ok';

function isEnabledFlag(value: unknown): boolean {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

export async function getExternalReferencesServiceStatus(env: Env): Promise<ExternalReferencesServiceStatus> {
  if (!isEnabledFlag(env.EXTERNAL_REFERENCES_ENABLED)) return 'disabled';

  // Health must be cheap and must not depend on external network calls.
  const health = await getExternalReferencesCacheHealth(env).catch(() => ({ lastOkAt: null, lastErrorAt: null }));
  if (!health.lastOkAt) return 'degraded';

  const lastOkMs = Date.parse(health.lastOkAt);
  if (!Number.isFinite(lastOkMs)) return 'degraded';

  // Consider "ok" when we had at least one successful refresh recently.
  const maxAgeMs = 24 * 60 * 60 * 1000;
  return Date.now() - lastOkMs <= maxAgeMs ? 'ok' : 'degraded';
}

export interface ExternalQuote {
  price: number;
  currency: string | null;
  asOf: string | null;
  source: string;
}

export async function getExternalQuoteForStockBvmf(env: Env, code: string): Promise<ExternalQuote | null> {
  if (!isEnabledFlag(env.EXTERNAL_REFERENCES_ENABLED)) return null;
  const normalized = (code || '').trim().toUpperCase();
  if (!normalized) return null;

  const now = new Date();
  const nowIso = now.toISOString();
  const cacheKey = `quote:stock:${normalized}:BVMF`;

  const cached = await findFreshExternalReferenceCacheByKey(env, cacheKey, nowIso).catch(() => null);
  if (cached?.status === 'ok') {
    const parsed = safeJsonParse<Record<string, unknown>>(cached.value_json);
    const price = coerceNumber(parsed?.price);
    if (price != null) {
      return {
        price,
        currency: typeof parsed?.currency === 'string' ? parsed.currency : null,
        asOf: typeof parsed?.asOf === 'string' ? parsed.asOf : null,
        source: cached.source
      };
    }
  }

  const fetched = await fetchQuoteFromBrapi(env, normalized);
  const ttlOkMs = 15 * 60 * 1000;
  const ttlErrMs = 2 * 60 * 1000;
  const expiresAt = new Date(now.getTime() + (fetched ? ttlOkMs : ttlErrMs)).toISOString();

  if (!fetched) {
    await upsertExternalReferenceCache(env, {
      cacheKey,
      kind: 'quote',
      source: 'brapi',
      valueJson: JSON.stringify({ code: normalized }),
      fetchedAt: nowIso,
      expiresAt,
      status: 'error',
      errorMessage: 'quote_unavailable'
    }).catch(() => {});
    return null;
  }

  await upsertExternalReferenceCache(env, {
    cacheKey,
    kind: 'quote',
    source: 'brapi',
    valueJson: JSON.stringify({
      code: normalized,
      price: fetched.price,
      currency: fetched.currency,
      asOf: fetched.asOf
    }),
    fetchedAt: nowIso,
    expiresAt,
    status: 'ok',
    errorMessage: null
  }).catch(() => {});

  return fetched;
}

async function fetchQuoteFromBrapi(env: Env, code: string): Promise<ExternalQuote | null> {
  const base = (env.EXTERNAL_REFERENCES_BRAPI_BASE_URL || 'https://brapi.dev/api').replace(/\/+$/, '');
  const token = (env.EXTERNAL_REFERENCES_BRAPI_TOKEN || '').trim();
  const url = new URL(`${base}/quote/${encodeURIComponent(code)}`);
  if (token) url.searchParams.set('token', token);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { accept: 'application/json' },
      signal: controller.signal
    });
    if (!res.ok) return null;
    const json = await res.json<any>().catch(() => null);
    const first = pickFirstResult(json);
    if (!first) return null;

    const price =
      coerceNumber(first.regularMarketPrice) ??
      coerceNumber(first.price) ??
      coerceNumber(first.lastPrice) ??
      coerceNumber(first.close);
    if (price == null) return null;

    const asOf =
      coerceIsoFromUnixSeconds(first.regularMarketTime) ??
      (typeof first.updatedAt === 'string' ? first.updatedAt : null) ??
      null;

    const currency = typeof first.currency === 'string' ? first.currency : null;
    return { price, currency, asOf, source: 'brapi' };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function pickFirstResult(value: any): any | null {
  if (!value || typeof value !== 'object') return null;
  const results = (value.results ?? value.result ?? value.data) as unknown;
  if (Array.isArray(results) && results.length) return results[0];
  if (Array.isArray(value) && value.length) return value[0];
  return null;
}

function safeJsonParse<T>(value: unknown): T | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
  return null;
}

function coerceIsoFromUnixSeconds(value: unknown): string | null {
  const seconds = coerceNumber(value);
  if (seconds == null) return null;
  const ms = seconds * 1000;
  const date = new Date(ms);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

