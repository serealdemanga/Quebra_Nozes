export type ApiClientOptions = {
  baseUrl?: string;
};

export function createApiClient(opts: ApiClientOptions = {}) {
  const baseUrl =
    opts.baseUrl?.replace(/\/+$/, "") ??
    (import.meta.env.VITE_API_BASE_URL
      ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, "")
      : "");

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = baseUrl ? `${baseUrl}${path}` : path;
    const res = await fetch(url, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`API ${res.status} ${res.statusText}: ${body}`);
    }
    return (await res.json()) as T;
  }

  return { request };
}

