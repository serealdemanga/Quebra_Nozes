import { describe, expect, it } from 'vitest';
import {
  buildHeaderMap,
  inferB3SourceKind,
  normalizeNumber,
  parseCsv,
  validateB3Headers,
  validateTemplateHeaders
} from './import_parsing';

describe('import_parsing', () => {
  it('parseCsv handles BOM, empty lines and quotes', () => {
    const csv = '\uFEFFcodigo,produto,quantidade\n"PETR4","Acao, preferencial",10\n\n';
    const parsed = parseCsv(csv);
    expect(parsed.headers).toEqual(['codigo', 'produto', 'quantidade']);
    expect(parsed.rows.length).toBe(1);
    expect(parsed.rows[0][1]).toBe('Acao, preferencial');
  });

  it('validateTemplateHeaders enforces exact header order', () => {
    const ok = validateTemplateHeaders(['tipo', 'codigo', 'nome', 'quantidade', 'valor_investido', 'valor_atual', 'categoria', 'observacoes']);
    expect(ok).toBe('');
    const bad = validateTemplateHeaders(['codigo', 'tipo']);
    expect(bad.toLowerCase()).toContain('cabeçalho');
  });

  it('validateB3Headers reports missing columns', () => {
    const map = buildHeaderMap(['codigo', 'produto', 'quantidade']);
    const err = validateB3Headers(map);
    expect(err).toContain('preco_medio');
    expect(err).toContain('valor_atual');
  });

  it('normalizeNumber parses brazilian number formats', () => {
    expect(normalizeNumber('1.234,56')).toBeCloseTo(1234.56);
    expect(normalizeNumber('R$ 10,00')).toBeCloseTo(10);
    expect(normalizeNumber('')).toBe(0);
  });

  it('inferB3SourceKind detects pension and funds heuristics', () => {
    expect(inferB3SourceKind({ codigo: 'X', produto: 'VGBL XP', tipo: '', categoria: '' })).toBe('PREVIDENCIA');
    expect(inferB3SourceKind({ codigo: 'X', produto: 'FIC DI', tipo: '', categoria: '' })).toBe('FUNDOS');
  });
});

