import { describe, expect, it } from 'vitest';
import { extractSummaryFromMessaging, splitActionPlan } from './analysis_formatters';

describe('analysis_formatters', () => {
  it('splitActionPlan splits and caps items', () => {
    const input = 'A; B\nC. D • E;F;G;H;I;J';
    const out = splitActionPlan(input);
    expect(out.length).toBe(8);
    expect(out[0]).toBe('A');
    expect(out[1]).toBe('B');
  });

  it('extractSummaryFromMessaging reads summary string', () => {
    expect(extractSummaryFromMessaging('{"summary":"  ok  "}')).toBe('ok');
    expect(extractSummaryFromMessaging('{"summary":123}')).toBe('');
    expect(extractSummaryFromMessaging('')).toBe('');
  });
});

