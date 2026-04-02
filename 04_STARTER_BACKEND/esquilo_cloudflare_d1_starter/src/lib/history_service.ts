import type { Env } from '../types/env';
import { ok, fail } from './http';
import { hashToken } from './auth_crypto';
import { findHistorySessionStateByTokenHash, findPortfolioSnapshots, findLatestAnalysisBadgesByPortfolio } from '../repositories/history_repository';

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

function readCookie(cookieHeader: string, cookieName: string): string {
  const prefix = `${cookieName}=`;
  const match = cookieHeader.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : '';
}
