import { Router } from './lib/router';
import { fail } from './lib/http';
import { getHealth } from './routes/health';
import { getDashboardHome } from './routes/dashboard';
import { getPortfolio, getHoldingDetail } from './routes/portfolio';
import { getProfileContext, putProfileContext } from './routes/profile';
import { getAnalysis } from './routes/analysis';
import { getSnapshots, getTimeline, getImportsCenter } from './routes/history';
import { postImportStart, getImportPreview, patchImportRow, postImportRowDuplicateResolution, postImportCommit } from './routes/imports';
import { getPortfolioEntryOnboardingRoute } from './routes/onboarding';
import { getImportConflicts } from './routes/import_conflicts';
import { getImportDetail } from './routes/import_detail';
import { getImportEngineStatus } from './routes/import_engine_status';
import { postAuthRegister, postAuthLogin, getAuthSession, postAuthLogout, postAuthRecover } from './routes/auth';
import { getOperationalEvents } from './routes/ops';
import { logHttpRequest, logHttpUnhandledError } from './lib/logger';
import type { Env } from './types/env';

const router = new Router();

router.register('GET', '/v1/health', getHealth);
router.register('POST', '/v1/auth/register', postAuthRegister);
router.register('POST', '/v1/auth/login', postAuthLogin);
router.register('GET', '/v1/auth/session', getAuthSession);
router.register('POST', '/v1/auth/logout', postAuthLogout);
router.register('POST', '/v1/auth/recover', postAuthRecover);
router.register('GET', '/v1/dashboard/home', getDashboardHome);
router.register('GET', '/v1/portfolio', getPortfolio);
router.register('GET', '/v1/portfolio/:portfolioId/holdings/:holdingId', getHoldingDetail);
router.register('GET', '/v1/profile/context', getProfileContext);
router.register('PUT', '/v1/profile/context', putProfileContext);
router.register('GET', '/v1/onboarding/portfolio-entry', getPortfolioEntryOnboardingRoute);
router.register('GET', '/v1/analysis', getAnalysis);
router.register('GET', '/v1/history/snapshots', getSnapshots);
router.register('GET', '/v1/history/timeline', getTimeline);
router.register('GET', '/v1/history/imports', getImportsCenter);
router.register('POST', '/v1/imports/start', postImportStart);
router.register('GET', '/v1/imports/:importId/preview', getImportPreview);
router.register('GET', '/v1/imports/:importId/engine-status', getImportEngineStatus);
router.register('GET', '/v1/imports/:importId/conflicts', getImportConflicts);
router.register('GET', '/v1/imports/:importId/detail', getImportDetail);
router.register('PATCH', '/v1/imports/:importId/rows/:rowId', patchImportRow);
router.register('POST', '/v1/imports/:importId/rows/:rowId/duplicate-resolution', postImportRowDuplicateResolution);
router.register('POST', '/v1/imports/:importId/commit', postImportCommit);
router.register('GET', '/v1/ops/events', getOperationalEvents);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const startedAt = Date.now();
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();
    const cfRay = request.headers.get('cf-ray');
    const ip = request.headers.get('CF-Connecting-IP');

    try {
      const matched = await router.handle(request, env);
      const response = matched ?? fail(env.API_VERSION, 'route_not_found', 'Rota não encontrada.', 404);
      const requestId = response.headers.get('x-request-id');
      const errorCode = response.headers.get('x-error-code');
      logHttpRequest(env, {
        requestId,
        method,
        path,
        status: response.status,
        durationMs: Date.now() - startedAt,
        errorCode,
        cfRay,
        ip
      });
      return response;
    } catch (error) {
      logHttpUnhandledError(env, {
        requestId: null,
        method,
        path,
        cfRay,
        ip,
        error
      });
      const response = fail(env.API_VERSION, 'internal_error', 'Erro interno da API.', 500, {
        reason: String(error)
      });
      logHttpRequest(env, {
        requestId: response.headers.get('x-request-id'),
        method,
        path,
        status: response.status,
        durationMs: Date.now() - startedAt,
        errorCode: response.headers.get('x-error-code'),
        cfRay,
        ip
      });
      return response;
    }
  }
};
