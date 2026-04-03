import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

function loadOpenApi(): any {
  const path = resolve(process.cwd(), '..', '..', 'services', 'api', 'openapi.yaml');
  const raw = readFileSync(path, 'utf-8');
  return parse(raw);
}

describe('openapi contract (minimum)', () => {
  it('keeps critical imports routes present', () => {
    const spec = loadOpenApi();
    expect(spec.openapi).toBeTruthy();
    expect(spec.paths).toBeTruthy();
    expect(spec.paths['/v1/imports/start']?.post).toBeTruthy();
    expect(spec.paths['/v1/imports/{importId}/preview']?.get).toBeTruthy();
    expect(spec.paths['/v1/imports/{importId}/commit']?.post).toBeTruthy();
  });
});
