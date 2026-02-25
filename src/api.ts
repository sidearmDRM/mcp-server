const DEFAULT_BASE_URL = "https://api.sdrm.io";

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  }

  async get<T = unknown>(
    path: string,
    params?: Record<string, string | undefined>,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, v);
      }
    }
    return this.request<T>(url, { method: "GET" });
  }

  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>(new URL(`${this.baseUrl}${path}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async patch<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>(new URL(`${this.baseUrl}${path}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async delete<T = unknown>(path: string): Promise<T> {
    return this.request<T>(new URL(`${this.baseUrl}${path}`), {
      method: "DELETE",
    });
  }

  private async request<T>(url: URL, init: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
        ...(init.headers as Record<string, string>),
      },
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
      return text as T;
    }

    if (!res.ok) {
      const msg =
        (json as Record<string, string>)?.message ??
        (json as Record<string, string>)?.error ??
        text;
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }

    return json as T;
  }
}
