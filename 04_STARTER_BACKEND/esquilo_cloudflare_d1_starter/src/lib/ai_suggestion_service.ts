import type { Env } from '../types/env';
import { generateAiTextWithFallback } from './ai_provider';
import { updateAnalysisMessaging } from '../repositories/analysis_write_repository';

export type AiSuggestionState =
  | { status: 'disabled' }
  | { status: 'ready'; text: string; provider: 'openai' | 'gemini'; generatedAt: string }
  | { status: 'error'; message: string };

export async function getOrGenerateAiSuggestion(env: Env, input: {
  analysisId: string;
  messagingJson: string | null;
  promptData: {
    scoreValue: number;
    scoreStatus: string;
    primaryProblemTitle: string;
    primaryActionTitle: string;
    totals: { totalEquity: number; totalInvested: number; totalProfitLoss: number; totalProfitLossPct: number };
  };
}): Promise<AiSuggestionState> {
  const hasAnyKey = Boolean((env.OPENAI_API_KEY || '').trim() || (env.GEMINI_API_KEY || '').trim());
  if (!hasAnyKey) return { status: 'disabled' };

  const parsed = safeJson(input.messagingJson);
  const existing = parsed?.aiSuggestion;
  if (existing && typeof existing.text === 'string' && existing.text.trim() && typeof existing.generatedAt === 'string') {
    return {
      status: 'ready',
      text: existing.text.trim(),
      provider: existing.provider === 'gemini' ? 'gemini' : 'openai',
      generatedAt: existing.generatedAt
    };
  }

  const prompt = buildPrompt(input.promptData);
  const res = await generateAiTextWithFallback(env, { prompt, maxTokens: 280 });
  if (!res?.text) return { status: 'error', message: 'IA indisponível no momento.' };

  const generatedAt = new Date().toISOString();
  const nextMessaging = {
    ...(parsed || {}),
    aiSuggestion: { text: res.text.trim(), provider: res.provider, generatedAt }
  };
  await updateAnalysisMessaging(env, input.analysisId, JSON.stringify(nextMessaging));

  return { status: 'ready', text: res.text.trim(), provider: res.provider, generatedAt };
}

function safeJson(value: string | null): Record<string, any> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function buildPrompt(data: {
  scoreValue: number;
  scoreStatus: string;
  primaryProblemTitle: string;
  primaryActionTitle: string;
  totals: { totalEquity: number; totalInvested: number; totalProfitLoss: number; totalProfitLossPct: number };
}): string {
  return [
    'Você é um assistente financeiro do Esquilo Invest.',
    'Objetivo: explicar, de forma humana e acionável, o que observar na carteira e qual o próximo passo.',
    'Regras: não calcule score, não invente dados, não recomende ativos específicos. Use só os dados fornecidos.',
    '',
    `Patrimônio: R$ ${data.totals.totalEquity.toFixed(2)}`,
    `Investido: R$ ${data.totals.totalInvested.toFixed(2)}`,
    `Resultado: R$ ${data.totals.totalProfitLoss.toFixed(2)} (${data.totals.totalProfitLossPct.toFixed(2)}%)`,
    `Score: ${data.scoreValue} (${data.scoreStatus})`,
    `Principal problema: ${data.primaryProblemTitle}`,
    `Principal ação: ${data.primaryActionTitle}`,
    '',
    'Saída: 1 parágrafo curto + 3 bullets de próximos passos. Português do Brasil.'
  ].join('\n');
}

