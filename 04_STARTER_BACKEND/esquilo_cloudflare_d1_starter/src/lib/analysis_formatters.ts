export function splitActionPlan(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/\n|;|\.|•/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function extractSummaryFromMessaging(value: string | null): string {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const summary = parsed.summary;
    return typeof summary === 'string' ? summary.trim() : '';
  } catch {
    return '';
  }
}

