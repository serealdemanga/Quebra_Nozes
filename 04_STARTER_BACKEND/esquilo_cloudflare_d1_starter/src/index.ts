import { Router } from './lib/router';
import { fail } from './lib/http';
import { getHealth } from './routes/health';
import { getDashboardHome } from './routes/dashboard';
import { getPortfolio, getHoldingDetail } from './routes/portfolio';
import { getProfileContext, putProfileContext } from './routes/profile';
import { getAnalysis } from './routes/analysis';
import { getSnapshots } from './routes/history';
import { postImportStart, getImportPreview, postImportCommit } from './routes/imports';
import type { Env } from './types/env';

const router = new Router();

router.register('GET', '/v1/health', getHealth);
router.register('GET', '/v1/dashboard/home', getDashboardHome);
router.register('GET', '/v1/portfolio', getPortfolio);
router.register('GET', '/v1/portfolio/:portfolioId/holdings/:holdingId', getHoldingDetail);
router.register('GET', '/v1/profile/context', getProfileContext);
router.register('PUT', '/v1/profile/context', putProfileContext);
router.register('GET', '/v1/analysis', getAnalysis);
router.register('GET', '/v1/history/snapshots', getSnapshots);
router.register('POST', '/v1/imports/start', postImportStart);
router.register('GET', '/v1/imports/:importId/preview', getImportPreview);
router.register('POST', '/v1/imports/:importId/commit', postImportCommit);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const matched = await router.handle(request, env);
      if (matched) return matched;
      return fail(env.API_VERSION, 'route_not_found', 'Rota não encontrada.', 404);
    } catch (error) {
      return fail(env.API_VERSION, 'internal_error', 'Erro interno da API.', 500, {
        reason: String(error)
      });
    }
  }
};
