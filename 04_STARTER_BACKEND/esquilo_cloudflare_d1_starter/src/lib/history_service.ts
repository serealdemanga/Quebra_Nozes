import type { Env } from '../types/env';
import { ok, fail } from './http';
import { hashToken } from './auth_crypto';
import { findHistorySessionStateByTokenHash, findPortfolioSnapshots, findLatestAnalysisBadgesByPortfolio } from '../repositories/history_repository';
import { getOperationalEventsForUser } from './operational_events_service';

const AUTH_COOKIE_NAME = 'esquilo_session';

export async function getHistorySnapshotsData(request: Request, env: Env): Promise<Response> {
  const token = readCookie(request.headers.get('cookie') || '', AUTH_COOKIE_NAME);
  if (!token) return fail(env.API_VERSION, 'unauthorized', 'Sessao nao encontrada.', 401);

  const tokenHash = await hashToken(token);
  const session = await findHistorySessionStateByTokenHash(env, tokenHash);
  if (!session) return fail(env.API_VERSION, 'unauthorized', 'Sessao invalida.', 401);
  if (!session.hasContext) {
    return ok(env.API_VERSION, { screenState: 'redirect_onboarding', redirectTo: '/onboarding' });
  }
  if (!session.portfolioId) {
    return fail(env.API_VERSION, 'portfolio_not_found', 'Carteira principal nao encontrada.', 404);
  }

  const snapshots = await findPortfolioSnapshots(env, session.portfolioId);
  if (!snapshots.length) {
    return ok(env.API_VERSION, {
      screenState: 'empty',
      portfolioId: session.portfolioId,
      emptyState: {
        title: 'Seu histórico ainda não existe',
        body: 'Importe a carteira para gerar o primeiro snapshot e começar a evolução patrimonial.',
        ctaLabel: 'Importar carteira',
        target: '/import'
      },
      summary: {
        totalSnapshots: 0,
        latestReferenceDate: null
      },
      snapshots: []
    });
  }

  const badgeRows = await findLatestAnalysisBadgesByPortfolio(env, session.portfolioId);
  const badgeMap = new Map(badgeRows.map((row) => [row.snapshot_id, row]));

  return ok(env.API_VERSION, {
    screenState: 'ready',
    portfolioId: session.portfolioId,
    summary: {
      totalSnapshots: snapshots.length,
      latestReferenceDate: snapshots[0]?.reference_date || null
    },
    snapshots: snapshots.map((snapshot) => {
      const badge = badgeMap.get(snapshot.id);
      return {
        id: snapshot.id,
        referenceDate: snapshot.reference_date,
        totalEquity: Number(snapshot.total_equity || 0),
        totalInvested: Number(snapshot.total_invested || 0),
        totalProfitLoss: Number(snapshot.total_profit_loss || 0),
        totalProfitLossPct: Number(snapshot.total_profit_loss_pct || 0),
        createdAt: snapshot.created_at,
        analysisBadge: badge ? {
          status: badge.score_status || 'Análise disponível',
          primaryProblem: badge.primary_problem || '',
          primaryAction: badge.primary_action || ''
        } : null
      };
    })
  });
}

export async function getHistoryTimelineData(request: Request, env: Env): Promise<Response> {
  const token = readCookie(request.headers.get('cookie') || '', AUTH_COOKIE_NAME);
  if (!token) return fail(env.API_VERSION, 'unauthorized', 'Sessao nao encontrada.', 401);

  const tokenHash = await hashToken(token);
  const session = await findHistorySessionStateByTokenHash(env, tokenHash);
  if (!session) return fail(env.API_VERSION, 'unauthorized', 'Sessao invalida.', 401);
  if (!session.hasContext) {
    return ok(env.API_VERSION, { screenState: 'redirect_onboarding', redirectTo: '/onboarding' });
  }
  if (!session.portfolioId) {
    return fail(env.API_VERSION, 'portfolio_not_found', 'Carteira principal nao encontrada.', 404);
  }

  const url = new URL(request.url);
  const limit = clampInt(url.searchParams.get('limit'), 1, 50, 50);

  const snapshots = (await findPortfolioSnapshots(env, session.portfolioId)).slice(0, limit);
  const badgeRows = await findLatestAnalysisBadgesByPortfolio(env, session.portfolioId);
  const badgeMap = new Map(badgeRows.map((row) => [row.snapshot_id, row]));

  const events = await getOperationalEventsForUser(env, {
    userId: session.userId,
    portfolioId: session.portfolioId,
    limit
  });

  const snapshotItems = snapshots.map((snapshot) => {
    const badge = badgeMap.get(snapshot.id);
    return {
      kind: 'snapshot',
      id: snapshot.id,
      occurredAt: snapshot.created_at,
      referenceDate: snapshot.reference_date,
      createdAt: snapshot.created_at,
      totals: {
        totalEquity: Number(snapshot.total_equity || 0),
        totalInvested: Number(snapshot.total_invested || 0),
        totalProfitLoss: Number(snapshot.total_profit_loss || 0),
        totalProfitLossPct: Number(snapshot.total_profit_loss_pct || 0)
      },
      recommendation: badge ? {
        status: badge.score_status || 'Análise disponível',
        primaryProblem: badge.primary_problem || '',
        primaryAction: badge.primary_action || ''
      } : null
    };
  });

  const eventItems = events.map((evt) => ({
    kind: 'event',
    id: evt.id,
    occurredAt: evt.occurredAt,
    portfolioId: evt.portfolioId ?? null,
    type: evt.type,
    status: evt.status,
    message: evt.message ?? null
  }));

  const merged = [...snapshotItems, ...eventItems].sort((a, b) => {
    // Ordena mais recente primeiro.
    const at = Date.parse(a.occurredAt);
    const bt = Date.parse(b.occurredAt);
    return bt - at;
  }).slice(0, limit);

  if (!merged.length) {
    return ok(env.API_VERSION, {
      screenState: 'empty',
      portfolioId: session.portfolioId,
      emptyState: {
        title: 'Seu histórico ainda não existe',
        body: 'Quando você importar e revisar a carteira, os snapshots e eventos aparecem aqui.',
        ctaLabel: 'Importar carteira',
        target: '/import'
      },
      summary: {
        totalItems: 0,
        totalSnapshots: 0,
        totalEvents: 0,
        latestOccurredAt: null
      },
      items: []
    });
  }

  const totalSnapshots = merged.filter((x) => x.kind === 'snapshot').length;
  const totalEvents = merged.filter((x) => x.kind === 'event').length;

  return ok(env.API_VERSION, {
    screenState: 'ready',
    portfolioId: session.portfolioId,
    summary: {
      totalItems: merged.length,
      totalSnapshots,
      totalEvents,
      latestOccurredAt: merged[0]?.occurredAt ?? null
    },
    items: merged
  });
}

function readCookie(cookieHeader: string, cookieName: string): string {
  const prefix = `${cookieName}=`;
  const match = cookieHeader.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : '';
}

function clampInt(raw: string | null, min: number, max: number, fallback: number) {
  const n = raw ? Number(raw) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}
