/** Formata valor monetário em BRL. */
export function formatMoney(v: number): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  } catch {
    return `R$ ${v.toFixed(2)}`;
  }
}

/**
 * Formata percentual de performance (2 casas, sinal + explícito).
 * Ex: +12,50% / -3,00%
 */
export function formatPct(v: number): string {
  const n = Math.round(v * 100) / 100;
  const s = (n >= 0 ? `+${n}` : String(n)).replace('.', ',');
  return `${s}%`;
}

/**
 * Formata percentual de participação/distribuição (1 casa, sem sinal).
 * Ex: 42,5%
 */
export function formatPctShare(v: number): string {
  const n = Math.round(v * 10) / 10;
  return `${String(n).replace('.', ',')}%`;
}

/** Formata data+hora em pt-BR. */
export function formatDateTime(input: string | null): string {
  if (!input) return '—';
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(input));
  } catch {
    return input;
  }
}

/** Garante que um percentual fique entre 0 e 100. */
export function clampPct(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}
