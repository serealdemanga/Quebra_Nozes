import type { Env } from '../types/env';
import { ok } from '../lib/http';
import type { HomeData } from '../types/contracts';

export async function getDashboardHome(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const portfolioId = url.searchParams.get('portfolioId') ?? 'primary';

  const data: HomeData = {
    portfolioId,
    hero: {
      totalEquity: 0,
      totalInvested: 0,
      totalProfitLoss: 0,
      totalProfitLossPct: 0,
      statusLabel: 'Em leitura'
    },
    primaryProblem: {
      code: 'not_computed_yet',
      title: 'Leitura inicial pendente',
      body: 'A camada analítica ainda não foi ligada nesta base inicial.',
      severity: 'info'
    },
    primaryAction: {
      code: 'import_first_file',
      title: 'Importe sua carteira',
      body: 'O próximo passo é enviar um CSV ou extrato para montar a primeira leitura real.',
      ctaLabel: 'Importar carteira',
      target: '/import'
    },
    score: {
      value: 0,
      status: 'Em leitura',
      explanation: 'Sem snapshot e sem análise persistida.'
    },
    distribution: [],
    insights: [],
    updatedAt: new Date().toISOString()
  };

  return ok(env.API_VERSION, data);
}
