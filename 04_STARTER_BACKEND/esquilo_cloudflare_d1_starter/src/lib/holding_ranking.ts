export function buildRanking(input: { allocationPct: number; performancePct: number | null; hasQuote: boolean }) {
  let score = 70;
  const motives: string[] = [];

  if (input.performancePct != null) {
    if (input.performancePct > 15) {
      score += 10;
      motives.push('Boa performance relativa dentro da carteira');
    } else if (input.performancePct < -10) {
      score -= 20;
      motives.push('Performance fraca em relacao ao preco medio');
    }
  }

  if (input.allocationPct > 20) {
    score -= 15;
    motives.push('Peso elevado dentro da carteira');
  } else if (input.allocationPct > 8) {
    score += 5;
    motives.push('Peso relevante na composicao da carteira');
  }

  if (!input.hasQuote) {
    score -= 25;
    motives.push('Ativo sem cotacao atual');
  }

  score = Math.max(0, Math.min(100, score));
  return {
    score,
    status: score >= 75 ? 'Atrativo' : score >= 50 ? 'Neutro' : 'Atenção',
    motives,
    opportunityScore: Math.max(0, Math.min(100, score - (input.allocationPct > 20 ? 10 : 0)))
  };
}

export function buildRecommendation(input: { allocationPct: number; performancePct: number | null; hasQuote: boolean; analysisAction: string }) {
  if (!input.hasQuote) {
    return {
      code: 'monitor_without_quote',
      title: 'Monitorar sem cotacao',
      body: 'O ativo continua visivel, mas sem cotacao atual a leitura fica incompleta. Revise a origem dos dados antes de decidir.'
    };
  }
  if (input.performancePct != null && input.performancePct < -10 && input.allocationPct > 15) {
    return {
      code: 'review_exposure',
      title: 'Revisar exposicao',
      body: 'O ativo esta perdendo valor e ainda ocupa peso relevante na carteira. ' + appendAnalysisContext(input.analysisAction)
    };
  }
  if (input.performancePct != null && input.performancePct > 15 && input.allocationPct > 20) {
    return {
      code: 'protect_gain',
      title: 'Proteger ganho e rebalancear',
      body: 'Existe ganho acumulado e concentracao alta no ativo. ' + appendAnalysisContext(input.analysisAction)
    };
  }
  return {
    code: 'hold_and_monitor',
    title: 'Manter e monitorar',
    body: 'O ativo nao acendeu alerta critico isolado. ' + appendAnalysisContext(input.analysisAction)
  };
}

export function appendAnalysisContext(action: string): string {
  return action ? `Contexto da carteira: ${action}.` : 'Use isso junto com a leitura consolidada da carteira.';
}

