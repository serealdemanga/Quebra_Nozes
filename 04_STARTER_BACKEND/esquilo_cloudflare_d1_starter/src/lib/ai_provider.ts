import type { Env } from '../types/env';

export type AiResult = { text: string; provider: 'openai' | 'gemini' };
export type AiDiagnostics = { openai?: string; gemini?: string };

export async function generateAiTextWithFallback(env: Env, input: {
  prompt: string;
  maxTokens?: number;
}): Promise<AiResult | null> {
  const prompt = input.prompt.trim();
  if (!prompt) return null;

  const openaiKey = env.OPENAI_API_KEY || '';
  if (openaiKey) {
    const text = await tryOpenAi(openaiKey, prompt, input.maxTokens ?? 280).catch(() => '');
    if (text) return { text, provider: 'openai' };
  }

  const geminiKey = env.GEMINI_API_KEY || '';
  if (geminiKey) {
    const text = await tryGemini(geminiKey, prompt, input.maxTokens ?? 280).catch(() => '');
    if (text) return { text, provider: 'gemini' };
  }

  return null;
}

export async function generateAiTextWithFallbackDetailed(env: Env, input: {
  prompt: string;
  maxTokens?: number;
}): Promise<{ result: AiResult | null; diagnostics: AiDiagnostics }> {
  const prompt = input.prompt.trim();
  if (!prompt) return { result: null, diagnostics: {} };

  const diagnostics: AiDiagnostics = {};

  const openaiKey = env.OPENAI_API_KEY || '';
  if (openaiKey) {
    try {
      const text = await tryOpenAi(openaiKey, prompt, input.maxTokens ?? 280);
      if (text) return { result: { text, provider: 'openai' }, diagnostics };
      diagnostics.openai = 'openai_empty';
    } catch (error) {
      diagnostics.openai = toDiag('openai', error);
    }
  }

  const geminiKey = env.GEMINI_API_KEY || '';
  if (geminiKey) {
    try {
      const text = await tryGemini(geminiKey, prompt, input.maxTokens ?? 280);
      if (text) return { result: { text, provider: 'gemini' }, diagnostics };
      diagnostics.gemini = 'gemini_empty';
    } catch (error) {
      diagnostics.gemini = toDiag('gemini', error);
    }
  }

  return { result: null, diagnostics };
}

async function tryOpenAi(apiKey: string, prompt: string, maxTokens: number): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: prompt,
        max_output_tokens: maxTokens
      }),
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`openai_http_${res.status}`);
    const data = (await res.json()) as any;
    const direct = typeof data.output_text === 'string' ? data.output_text : '';
    if (direct.trim()) return direct.trim();
    // Fallback: tenta extrair do formato output[].
    const output = Array.isArray(data.output) ? data.output : [];
    for (const item of output) {
      const content = Array.isArray(item?.content) ? item.content : [];
      for (const part of content) {
        if (part?.type === 'output_text' && typeof part?.text === 'string' && part.text.trim()) return part.text.trim();
        if (typeof part?.text === 'string' && part.text.trim()) return part.text.trim();
      }
    }
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

async function tryGemini(apiKey: string, prompt: string, maxTokens: number): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4 }
      }),
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`gemini_http_${res.status}`);
    const data = (await res.json()) as any;
    const candidates = Array.isArray(data.candidates) ? data.candidates : [];
    const parts = candidates[0]?.content?.parts;
    if (Array.isArray(parts) && typeof parts[0]?.text === 'string') return String(parts[0].text).trim();
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

function toDiag(provider: 'openai' | 'gemini', error: unknown): string {
  if (error instanceof Error) {
    const msg = String(error.message || '').trim();
    if (msg) return msg.slice(0, 120);
    return `${provider}_error`;
  }
  return `${provider}_error_${String(error).slice(0, 120)}`;
}

