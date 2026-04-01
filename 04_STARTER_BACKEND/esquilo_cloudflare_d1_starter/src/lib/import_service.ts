import type { Env } from '../types/env';
import { ok, fail, readJson } from './http';
import { buildEntityId, hashToken } from './auth_crypto';
import {
  findImportSessionStateByTokenHash,
  createImportRecord,
  updateImportRecord,
  replaceImportRows,
  findImportById,
  findImportRows,
  findManualDuplicateCandidates,
  findAssetTypeByCode,
  findAssetByNormalizedNameOrCode,
  createAsset,
  createPortfolioPosition,
  createPortfolioSnapshot,
  createSnapshotPosition
} from '../repositories/import_repository';

const AUTH_COOKIE_NAME = 'esquilo_session';
const ORIGIN_MANUAL_ENTRY = 'MANUAL_ENTRY';
const VALID_SOURCE_KINDS = ['ACOES', 'FUNDOS', 'PREVIDENCIA'];

export async function startManualImport(request: Request, env: Env): Promise<Response> {
  const session = await requireImportSession(request, env);
  if (session instanceof Response) return session;

  const payload = await readJson<Record<string, unknown>>(request).catch(() => ({}));
  const origin = typeof payload.origin === 'string' ? payload.origin : ORIGIN_MANUAL_ENTRY;
  if (origin !== ORIGIN_MANUAL_ENTRY) {
    return fail(env.API_VERSION, 'unsupported_origin', 'Nesta etapa só MANUAL_ENTRY é suportado.', 400);
  }

  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  if (!entries.length) {
    return fail(env.API_VERSION, 'missing_entries', 'Envie ao menos um ativo manual.', 400);
  }

  const normalizedRows = [] as Array<{
    id: string;
    rowNumber: number;
    sourcePayloadJson: string;
    normalizedPayloadJson: string;
    resolutionStatus: string;
    errorMessage: string | null;
  }>;

  let validRows = 0;
  let invalidRows = 0;
  let duplicateRows = 0;

  for (let index = 0; index < entries.length; index += 1) {
    const entry = normalizeManualEntry(entries[index], index + 1);
    const duplicates = entry.normalizedName ? await findManualDuplicateCandidates(env, session.portfolioId, entry.normalizedName, entry.code) : [];

    let resolutionStatus = 'NORMALIZED';
    let errorMessage: string | null = null;

    if (entry.errors.length) {
      resolutionStatus = 'FAILED';
      errorMessage = entry.errors.join(' | ');
      invalidRows += 1;
    } else if (duplicates.length) {
      resolutionStatus = 'PENDING';
      errorMessage = 'Possível duplicidade com ativo já existente na carteira.';
      duplicateRows += 1;
    } else {
      validRows += 1;
    }

    normalizedRows.push({
      id: buildEntityId('imr'),
      rowNumber: index + 1,
      sourcePayloadJson: JSON.stringify(entries[index]),
      normalizedPayloadJson: JSON.stringify({
        sourceKind: entry.sourceKind,
        code: entry.code,
        name: entry.name,
        normalizedName: entry.normalizedName,
        quantity: entry.quantity,
        investedAmount: entry.investedAmount,
        currentAmount: entry.currentAmount,
        averagePrice: entry.averagePrice,
        currentPrice: entry.currentPrice,
        categoryLabel: entry.categoryLabel,
        notes: entry.notes,
        duplicateCandidates: duplicates
      }),
      resolutionStatus,
      errorMessage
    });
  }

  const importId = buildEntityId('imp');
  const status = invalidRows === 0 && duplicateRows === 0 ? 'PREVIEW_READY' : 'PROCESSING';

  await createImportRecord(env, {
    importId,
    userId: session.userId,
    portfolioId: session.portfolioId,
    status,
    origin,
    totalRows: entries.length,
    validRows,
    invalidRows,
    duplicateRows
  });

  await replaceImportRows(env, importId, normalizedRows);

  return ok(env.API_VERSION, {
    importId,
    status: 'pending_preview',
    nextStep: `/v1/imports/${importId}/preview`,
    totals: {
      totalRows: entries.length,
      validRows,
      invalidRows,
      duplicateRows
    }
  });
}

export async function getManualImportPreview(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const session = await requireImportSession(request, env);
  if (session instanceof Response) return session;

  const importRecord = await findImportById(env, params.importId);
  if (!importRecord || importRecord.user_id !== session.userId) {
    return fail(env.API_VERSION, 'import_not_found', 'Importação não encontrada.', 404);
  }

  const rows = await findImportRows(env, params.importId);

  return ok(env.API_VERSION, {
    importId: params.importId,
    status: importRecord.status,
    origin: importRecord.origin,
    totals: {
      totalRows: importRecord.total_rows,
      validRows: importRecord.valid_rows,
      invalidRows: importRecord.invalid_rows,
      duplicateRows: importRecord.duplicate_rows
    },
    readyToCommit: importRecord.status !== 'COMMITTED' && importRecord.invalid_rows === 0 && importRecord.duplicate_rows === 0,
    rows: rows.map((row) => ({
      id: row.id,
      rowNumber: row.row_number,
      source: parseJson(row.source_payload_json, {}),
      normalized: parseJson(row.normalized_payload_json, {}),
      resolutionStatus: row.resolution_status,
      errorMessage: row.error_message
    }))
  });
}

export async function commitManualImport(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const session = await requireImportSession(request, env);
  if (session instanceof Response) return session;

  const importRecord = await findImportById(env, params.importId);
  if (!importRecord || importRecord.user_id !== session.userId) {
    return fail(env.API_VERSION, 'import_not_found', 'Importação não encontrada.', 404);
  }
  if (importRecord.status === 'COMMITTED') {
    return fail(env.API_VERSION, 'import_already_committed', 'Esta importação já foi commitada.', 409);
  }

  const rows = await findImportRows(env, params.importId);
  const hasBlockingIssue = rows.some((row) => row.resolution_status !== 'NORMALIZED');
  if (hasBlockingIssue || importRecord.invalid_rows > 0 || importRecord.duplicate_rows > 0) {
    return fail(env.API_VERSION, 'preview_not_consistent', 'O preview ainda possui pendências e não pode ser commitado.', 409);
  }

  const createdAssets = [] as Array<{ assetId: string; quantity: number; currentPrice: number | null; currentValue: number }>;
  let totalEquity = 0;
  let totalInvested = 0;

  for (const row of rows) {
    const normalized = parseJson(row.normalized_payload_json, {}) as Record<string, unknown>;
    const sourceKind = String(normalized.sourceKind || '');
    const code = String(normalized.code || '');
    const name = String(normalized.name || '');
    const normalizedName = String(normalized.normalizedName || '');
    const quantity = Number(normalized.quantity || 0);
    const investedAmount = Number(normalized.investedAmount || 0);
    const currentAmount = Number(normalized.currentAmount || 0);
    const averagePrice = Number(normalized.averagePrice || 0);
    const currentPrice = normalized.currentPrice == null ? null : Number(normalized.currentPrice);
    const categoryLabel = String(normalized.categoryLabel || '');
    const notes = String(normalized.notes || '');

    const assetType = await findAssetTypeByCode(env, mapSourceKindToAssetTypeCode(sourceKind));
    if (!assetType) {
      return fail(env.API_VERSION, 'asset_type_not_found', 'Tipo de ativo não encontrado para commit manual.', 500);
    }

    let asset = await findAssetByNormalizedNameOrCode(env, normalizedName, code);
    if (!asset) {
      const assetId = buildEntityId('ast');
      await createAsset(env, {
        assetId,
        assetTypeId: assetType.id,
        code,
        name,
        normalizedName
      });
      asset = { id: assetId, code, name };
    }

    const positionId = buildEntityId('pos');
    await createPortfolioPosition(env, {
      positionId,
      portfolioId: session.portfolioId,
      assetId: asset.id,
      sourceKind,
      quantity,
      averagePrice,
      currentPrice,
      investedAmount,
      currentAmount,
      categoryLabel,
      notes
    });

    createdAssets.push({ assetId: asset.id, quantity, currentPrice, currentValue: currentAmount });
    totalEquity += currentAmount;
    totalInvested += investedAmount;
  }

  const totalProfitLoss = totalEquity - totalInvested;
  const totalProfitLossPct = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
  const snapshotId = buildEntityId('snp');
  const referenceDate = new Date().toISOString().slice(0, 10);

  await createPortfolioSnapshot(env, {
    snapshotId,
    portfolioId: session.portfolioId,
    importId: params.importId,
    referenceDate,
    totalEquity,
    totalInvested,
    totalProfitLoss,
    totalProfitLossPct
  });

  for (const asset of createdAssets) {
    await createSnapshotPosition(env, {
      snapshotPositionId: buildEntityId('sps'),
      snapshotId,
      assetId: asset.assetId,
      quantity: asset.quantity,
      unitPrice: asset.currentPrice,
      currentValue: asset.currentValue
    });
  }

  await updateImportRecord(env, {
    importId: params.importId,
    status: 'COMMITTED',
    totalRows: importRecord.total_rows,
    validRows: importRecord.valid_rows,
    invalidRows: importRecord.invalid_rows,
    duplicateRows: importRecord.duplicate_rows,
    finishedAt: true
  });

  return ok(env.API_VERSION, {
    importId: params.importId,
    status: 'committed',
    createdSnapshotId: snapshotId,
    affectedPositions: createdAssets.length,
    nextStep: '/history/snapshots'
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

function normalizeManualEntry(value: unknown, rowNumber: number) {
  const source = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
  const sourceKind = normalizeSourceKind(source.sourceKind);
  const code = normalizeText(source.code).toUpperCase();
  const name = normalizeText(source.name);
  const normalizedName = normalizeName(name || code);
  const quantity = normalizeNumber(source.quantity);
  const investedAmount = normalizeNumber(source.investedAmount);
  const currentAmount = normalizeNumber(source.currentAmount);
  const averagePrice = quantity > 0 ? investedAmount / quantity : 0;
  const currentPrice = quantity > 0 ? currentAmount / quantity : null;
  const categoryLabel = normalizeText(source.categoryLabel) || mapCategoryLabel(sourceKind);
  const notes = normalizeText(source.notes);
  const errors: string[] = [];

  if (!sourceKind) errors.push(`Linha ${rowNumber}: tipo inválido.`);
  if (!name && !code) errors.push(`Linha ${rowNumber}: informe nome ou código.`);
  if (quantity <= 0) errors.push(`Linha ${rowNumber}: quantidade deve ser maior que zero.`);
  if (investedAmount <= 0) errors.push(`Linha ${rowNumber}: valor investido deve ser maior que zero.`);
  if (currentAmount < 0) errors.push(`Linha ${rowNumber}: valor atual não pode ser negativo.`);

  return {
    sourceKind,
    code,
    name: name || code,
    normalizedName,
    quantity,
    investedAmount,
    currentAmount,
    averagePrice,
    currentPrice,
    categoryLabel,
    notes,
    errors
  };
}

function normalizeSourceKind(value: unknown): string {
  const raw = normalizeText(value).toUpperCase();
  return VALID_SOURCE_KINDS.includes(raw) ? raw : '';
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
  return 0;
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function mapSourceKindToAssetTypeCode(sourceKind: string): string {
  if (sourceKind === 'ACOES') return 'STOCK';
  if (sourceKind === 'FUNDOS') return 'FUND';
  return 'PENSION';
}

function mapCategoryLabel(sourceKind: string): string {
  if (sourceKind === 'ACOES') return 'Ações';
  if (sourceKind === 'FUNDOS') return 'Fundos';
  return 'Previdência';
}

function parseJson(value: unknown, fallback: Record<string, unknown>) {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return fallback;
  }
}

function readCookie(cookieHeader: string, cookieName: string): string {
  const prefix = `${cookieName}=`;
  const match = cookieHeader.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : '';
}
