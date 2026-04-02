import type { Env } from '../types/env';
import { ok, fail } from './http';
import { hashToken } from './auth_crypto';
import { findImportSessionStateByTokenHash, findImportById, findImportRows } from '../repositories/import_repository';

const AUTH_COOKIE_NAME = 'esquilo_session';

export async function getImportDetailData(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const session = await requireImportSession(request, env);
  if (session instanceof Response) return session;

  const importRecord = await findImportById(env, params.importId);
  if (!importRecord || importRecord.user_id !== session.userId) {
    return fail(env.API_VERSION, 'import_not_found', 'Importação não encontrada.', 404);
  }

  const rows = await findImportRows(env, params.importId);
  const snapshot = await findSnapshotByImportId(env, params.importId);

  return ok(env.API_VERSION, {
    screenState: 'ready',
    importId: params.importId,
    importMeta: {
      origin: importRecord.origin,
      originLabel: mapOriginLabel(importRecord.origin),
      status: importRecord.status,
      statusLabel: mapStatusLabel(importRecord.status),
      totalRows: Number(importRecord.total_rows || 0),
      validRows: Number(importRecord.valid_rows || 0),
      invalidRows: Number(importRecord.invalid_rows || 0),
      duplicateRows: Number(importRecord.duplicate_rows || 0),
      createdAt: importRecord.created_at,
      updatedAt: importRecord.updated_at || importRecord.created_at,
      finishedAt: importRecord.finished_at || null,
      fileName: importRecord.file_name || null,
      mimeType: importRecord.mime_type || null
    },
    snapshot: snapshot ? {
      id: snapshot.id,
      referenceDate: snapshot.reference_date,
      totalEquity: Number(snapshot.total_equity || 0),
      totalInvested: Number(snapshot.total_invested || 0),
      totalProfitLoss: Number(snapshot.total_profit_loss || 0),
      totalProfitLossPct: Number(snapshot.total_profit_loss_pct || 0),
      target: '/history/snapshots'
    } : null,
    rows: rows.map((row) => {
      const source = parseJson(row.source_payload_json, {});
      const normalized = parseJson(row.normalized_payload_json, {});
      return {
        rowId: row.id,
        rowNumber: row.row_number,
        resolutionStatus: row.resolution_status,
        errorMessage: row.error_message,
        source,
        normalized: {
          sourceKind: String(normalized.sourceKind || ''),
          code: String(normalized.code || ''),
          name: String(normalized.name || ''),
          normalizedName: String(normalized.normalizedName || ''),
          quantity: Number(normalized.quantity || 0),
          investedAmount: Number(normalized.investedAmount || 0),
          currentAmount: Number(normalized.currentAmount || 0),
          averagePrice: normalized.averagePrice == null ? null : Number(normalized.averagePrice || 0),
          currentPrice: normalized.currentPrice == null ? null : Number(normalized.currentPrice || 0),
          categoryLabel: String(normalized.categoryLabel || ''),
          notes: String(normalized.notes || '')
        },
        fieldSources: normalized.fieldSources || {},
        fieldConfidences: normalized.fieldConfidences || {},
        warnings: Array.isArray(normalized.warnings) ? normalized.warnings : [],
        reviewMeta: typeof normalized.reviewMeta === 'object' && normalized.reviewMeta !== null ? normalized.reviewMeta : {},
        documentMeta: typeof normalized.documentMeta === 'object' && normalized.documentMeta !== null ? normalized.documentMeta : null,
        duplicateCandidates: Array.isArray(normalized.duplicateCandidates) ? normalized.duplicateCandidates : []
      };
    })
  });
}

async function requireImportSession(request: Request, env: Env): Promise<{ userId: string; portfolioId: string } | Response> {
  const token = readCookie(request.headers.get('cookie') || '', AUTH_COOKIE_NAME);
  if (!token) return fail(env.API_VERSION, 'unauthorized', 'Sessão não encontrada.', 401);
  const tokenHash = await hashToken(token);
  const session = await findImportSessionStateByTokenHash(env, tokenHash);
  if (!session) return fail(env.API_VERSION, 'unauthorized', 'Sessão inválida.', 401);
  if (!session.hasContext) return ok(env.API_VERSION, { screenState: 'redirect_onboarding', redirectTo: '/onboarding' });
  if (!session.portfolioId) return fail(env.API_VERSION, 'portfolio_not_found', 'Carteira principal não encontrada.', 404);
  return { userId: session.userId, portfolioId: session.portfolioId };
}

async function findSnapshotByImportId(env: Env, importId: string) {
  return await env.DB.prepare(
    `SELECT id, reference_date, total_equity, total_invested, total_profit_loss, total_profit_loss_pct
       FROM portfolio_snapshots
      WHERE import_id = ?
      ORDER BY created_at DESC
      LIMIT 1`
  ).bind(importId).first<{
    id: string;
    reference_date: string;
    total_equity: number | null;
    total_invested: number | null;
    total_profit_loss: number | null;
    total_profit_loss_pct: number | null;
  }>();
}

function mapOriginLabel(origin: string): string {
  if (origin === 'MANUAL_ENTRY') return 'Manual';
  if (origin === 'CUSTOM_TEMPLATE') return 'Template próprio';
  if (origin === 'B3_CSV') return 'CSV da B3';
  if (origin === 'DOCUMENT_AI_PARSE') return 'Documento assistido';
  return origin;
}

function mapStatusLabel(status: string): string {
  if (status === 'COMMITTED') return 'Concluída';
  if (status === 'PREVIEW_READY') return 'Pronta para commit';
  if (status === 'PROCESSING') return 'Em revisão';
  if (status === 'FAILED') return 'Falhou';
  return status;
}

function parseJson(value: unknown, fallback: Record<string, any>) {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readCookie(cookieHeader: string, cookieName: string): string {
  const prefix = `${cookieName}=`;
  const match = cookieHeader.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : '';
}
