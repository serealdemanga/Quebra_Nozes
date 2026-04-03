import { describe, expect, it } from 'vitest';
import { buildRanking, buildRecommendation } from './holding_ranking';

describe('holding_ranking', () => {
  it('penalizes missing quote strongly', () => {
    const r = buildRanking({ allocationPct: 5, performancePct: 5, hasQuote: false });
    expect(r.score).toBeLessThanOrEqual(50);
    expect(r.motives.some((m) => m.toLowerCase().includes('sem cotacao'))).toBe(true);
  });

  it('flags high concentration', () => {
    const r = buildRanking({ allocationPct: 25, performancePct: 0, hasQuote: true });
    expect(r.motives.some((m) => m.toLowerCase().includes('peso'))).toBe(true);
    expect(r.opportunityScore).toBeLessThanOrEqual(r.score);
  });

  it('recommends review exposure on loss + high allocation', () => {
    const rec = buildRecommendation({ allocationPct: 16, performancePct: -11, hasQuote: true, analysisAction: 'Rebalancear' });
    expect(rec.code).toBe('review_exposure');
    expect(rec.body.toLowerCase()).toContain('contexto');
  });
});

