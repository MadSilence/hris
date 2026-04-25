import { BadRequestError, ForbiddenError, NotFoundError, ServerError, UnauthorizedError } from "@/components/clients/exceptions";

export class InternalApiClient {
  private readonly apiPath = "/api";
  public constructor(private readonly basePath: string) {}

  public async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  public async post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  public async fetch(path: string, init?: RequestInit): Promise<Response> {
    const url = this.basePath + this.apiPath + path;
    const response = await fetch(url, { ...init, credentials: "same-origin" });
    await this.throwIfError(response, path, init?.method ?? "GET");
    return response;
  }

  private async request<T>(method: string, path: string, body?: object): Promise<T> {
    const url = this.basePath + this.apiPath + path;

    const headers: Record<string, string> = {};
    const hasBody = body !== undefined;
    if (hasBody) headers["Content-Type"] = "application/json";

    const response = await fetch(url, {
      method,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });

    await this.throwIfError(response, path, method);

    const text = await response.text();
    if (!text) {
      // @ts-expect-error – allow void/undefined for endpoints that return no JSON
      return undefined;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ServerError(`Invalid JSON received from ${path}`);
    }
  }

  private async throwIfError(response: Response, path: string, method: string = "GET") {
    if (response.ok || response.status === 304) return;

    let message: string | undefined;
    const ct = response.headers.get("content-type") || "";
    try {
      if (ct.includes("application/json")) {
        const data = await response.json().catch(() => ({}));
        message = (data && (data.message || data.error)) ?? undefined;
      } else {
        const text = await response.text().catch(() => "");
        message = text?.trim();
      }
    } catch {
      // ignore parsing errors, fall back to generic message
    }

    const friendly = message || `HTTP ${response.status} while fetching ${path}`;

    switch (response.status) {
      case 400:
        throw new BadRequestError(friendly);
      case 404:
        throw new NotFoundError();
      case 401:
        throw new UnauthorizedError(friendly);
      case 403:
        if (typeof window !== "undefined" && method !== "GET") {
          window.dispatchEvent(new CustomEvent("hris:forbidden", { detail: friendly }));
        }
        throw new ForbiddenError(friendly);
      case 409:
      case 422:
      case 429:
      case 500:
      case 502:
      case 503:
      default:
        throw new ServerError(friendly);
    }
  }
}
