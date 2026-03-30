import type { Env } from '../types/env';
import { ok } from '../lib/http';

export async function getAnalysis(_request: Request, env: Env): Promise<Response> {
  return ok(env.API_VERSION, {
    analysisId: 'stub-analysis',
    portfolioId: 'primary',
    snapshotId: 'stub-snapshot',
    score: {
      value: 0,
      status: 'Em leitura',
      explanation: 'A análise ainda não foi calculada nesta base inicial.'
    },
    primaryProblem: {
      code: 'no_analysis',
      title: 'Sem análise gerada',
      body: 'A carteira ainda precisa de snapshot e motor analítico ativo.',
      severity: 'info'
    },
    primaryAction: {
      code: 'generate_snapshot',
      title: 'Gerar primeiro snapshot',
      body: 'Feche uma importação e gere um snapshot para liberar a análise.',
      ctaLabel: 'Ir para importação',
      target: '/import'
    },
    insights: [],
    generatedAt: new Date().toISOString()
  });
}
