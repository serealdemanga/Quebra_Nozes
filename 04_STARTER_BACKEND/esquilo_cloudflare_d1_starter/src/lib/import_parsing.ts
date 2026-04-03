export const VALID_SOURCE_KINDS = ['ACOES', 'FUNDOS', 'PREVIDENCIA'] as const;
export const TEMPLATE_HEADERS = ['tipo', 'codigo', 'nome', 'quantidade', 'valor_investido', 'valor_atual', 'categoria', 'observacoes'] as const;
export const B3_REQUIRED_HEADERS = ['codigo', 'produto', 'quantidade', 'preco_medio', 'valor_atual'] as const;

export function parseCsv(csvContent: string): { headers: string[]; rows: string[][] } {
  const lines = csvContent
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');
  if (!lines.length) return { headers: [], rows: [] };
  const rows = lines.map(parseCsvLine);
  return { headers: rows[0].map((item) => item.trim()), rows: rows.slice(1) };
}

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function validateTemplateHeaders(headers: string[]): string {
  const normalized = headers.map((item) => item.trim().toLowerCase());
  if (normalized.length !== TEMPLATE_HEADERS.length) return `Cabeçalho inválido. Esperado: ${TEMPLATE_HEADERS.join(',')}`;
  for (let index = 0; index < TEMPLATE_HEADERS.length; index += 1) {
    if (normalized[index] !== TEMPLATE_HEADERS[index]) return `Cabeçalho inválido. Esperado: ${TEMPLATE_HEADERS.join(',')}`;
  }
  return '';
}

export function buildHeaderMap(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  headers.forEach((header, index) => {
    map[header.trim().toLowerCase()] = index;
  });
  return map;
}

export function validateB3Headers(headerMap: Record<string, number>): string {
  const missing = B3_REQUIRED_HEADERS.filter((header) => !(header in headerMap));
  return missing.length ? `Layout B3 inválido. Colunas obrigatórias ausentes: ${missing.join(',')}` : '';
}

export function mapTemplateRowToRawEntry(row: string[]): Record<string, unknown> {
  const values = [...row];
  while (values.length < TEMPLATE_HEADERS.length) values.push('');
  return {
    tipo: values[0] || '',
    codigo: values[1] || '',
    nome: values[2] || '',
    quantidade: values[3] || '',
    valor_investido: values[4] || '',
    valor_atual: values[5] || '',
    categoria: values[6] || '',
    observacoes: values[7] || ''
  };
}

export function mapB3RowToRawEntry(row: string[], headerMap: Record<string, number>): Record<string, unknown> {
  const codigo = getCsvValue(row, headerMap, 'codigo');
  const produto = getCsvValue(row, headerMap, 'produto');
  const quantidade = getCsvValue(row, headerMap, 'quantidade');
  const precoMedio = getCsvValue(row, headerMap, 'preco_medio');
  const valorAtual = getCsvValue(row, headerMap, 'valor_atual');
  const tipo = inferB3SourceKind({
    codigo,
    produto,
    tipo: getCsvValue(row, headerMap, 'tipo'),
    categoria: getCsvValue(row, headerMap, 'categoria')
  });
  return {
    tipo,
    codigo,
    nome: produto,
    quantidade,
    preco_medio: precoMedio,
    valor_atual: valorAtual,
    categoria: mapCategoryLabel(tipo),
    observacoes: 'Importado de CSV B3'
  };
}

export function inferB3SourceKind(input: { codigo: string; produto: string; tipo: string; categoria: string }): string {
  const explicit = normalizeSourceKind(input.tipo || input.categoria);
  if (explicit) return explicit;
  const raw = `${input.codigo} ${input.produto}`.toLowerCase();
  if (raw.includes('previd') || raw.includes('vgbl') || raw.includes('pgbl')) return 'PREVIDENCIA';
  if (raw.includes('fundo') || raw.includes('fic') || raw.includes('fia') || raw.includes('multimercado') || raw.includes('di ')) return 'FUNDOS';
  return 'ACOES';
}

export function normalizeSourceKind(value: unknown): string {
  const raw = normalizeText(value).toUpperCase();
  return (VALID_SOURCE_KINDS as unknown as string[]).includes(raw) ? raw : '';
}

export function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const sanitized = value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
    const parsed = Number(sanitized);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

export function mapCategoryLabel(sourceKind: string): string {
  if (sourceKind === 'ACOES') return 'Ações';
  if (sourceKind === 'FUNDOS') return 'Fundos';
  return 'Previdência';
}

function getCsvValue(row: string[], headerMap: Record<string, number>, key: string): string {
  const index = headerMap[key];
  return index == null ? '' : (row[index] || '').trim();
}

