import { BadRequestError, ForbiddenError, NotFoundError, ServerError, UnauthorizedError } from "@/components/clients/exceptions";

/**
 * A 401 does not always mean the session is gone. Editing role permissions and starting or stopping
 * impersonation rotate the user's perm-hash, and every request that was already in flight still
 * carries the previous token — those land after the new cookie is in place and come back 401. The
 * cure used to be a hard redirect to /login, which threw people out of a perfectly good session
 * (pressing Back put them right back where they were).
 *
 * So: ask once whether the session is actually dead before redirecting. The probe is a fresh
 * request, so it carries whatever cookie is current — exactly the thing the stale request lacked.
 * Single-flight, and the answer is dropped after a second so a real logout is noticed promptly.
 */
const SESSION_PROBE_PATH = "/api/users/me";
let sessionProbe: Promise<boolean> | null = null;

/** Wrapped so tests can observe the redirect: jsdom's location is read-only. */
export const sessionNavigation = {
  redirectToLogin() {
    window.location.assign("/login");
  },
};

async function isSessionAlive(): Promise<boolean> {
  if (!sessionProbe) {
    sessionProbe = fetch(SESSION_PROBE_PATH, { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok)
      .catch(() => false);
    void sessionProbe.finally(() => {
      setTimeout(() => {
        sessionProbe = null;
      }, 1000);
    });
  }
  return sessionProbe;
}

export class InternalApiClient {
  private readonly apiPath = "/api";
  public constructor(private readonly basePath: string) {}

  public async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  public async post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  public async put<T, B extends object = Record<string, unknown>>(path: string, body?: B): Promise<T> {
    return this.request<T>("PUT", path, body);
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
      case 401: {
        // Redirect only if the session is really dead (see the note above isSessionAlive). A stale
        // in-flight request still throws, so the caller can refetch with the current token.
        const onLoginPage =
          typeof window === "undefined" || window.location.pathname.startsWith("/login");
        const isProbe = path === SESSION_PROBE_PATH.replace("/api", "");
        if (!onLoginPage && !isProbe && !(await isSessionAlive())) {
          sessionNavigation.redirectToLogin();
        }
        throw new UnauthorizedError(friendly);
      }
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
