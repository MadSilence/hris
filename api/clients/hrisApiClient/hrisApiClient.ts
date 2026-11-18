import {
  ApiErrorInit,
  BackendUnavailableError,
  BadRequestError,
  ConflictError,
  NotEntitledError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "@/components/clients/exceptions";
import { cookies, headers as nextHeaders } from "next/headers";
import publicConfig from "@/config/publicConfig";
import { backendTunnelHeaders } from "@/config/backendTunnel";
import { isPublicBackendPath } from "@/config/security/publicBackendPaths";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/config/security/sessionCookieNames";
import { setSessionCookies } from "@/api/modules/auth/services/sessionCookies";

/**
 * One renewal per refresh token at a time: two calls of the same action that both meet an expired token share it,
 * instead of the second trading a token the first has just spent (the backend rotates it on every use).
 */
const renewals = new Map<string, Promise<string | null>>();

/** One cookie's value out of a `Set-Cookie` header — the refresh token the backend hands back. */
const setCookieValue = (response: Response, name: string): string | undefined => {
  const header = response.headers.get("set-cookie");
  if (!header) return undefined;
  const match = new RegExp(`(?:^|,\\s*)${name.replace(/[-]/g, "\\-")}=([^;]*)`).exec(header);
  return match?.[1] || undefined;
};

type HeaderReader = { get(name: string): string | null };

/** The browser's request, when there is one; outside a request there is nobody to speak for. */
const incomingHeaders = async (): Promise<HeaderReader | null> => {
  try {
    return await nextHeaders();
  } catch {
    return null;
  }
};

/**
 * Who is really calling, carried to the backend.
 *
 * Every call to Java leaves from this server, so without these the backend saw **one caller for the
 * whole product**: the BFF's own address and Node's user agent. Sign-in's per-address throttle then
 * counted everybody together — ten mistyped sign-ins anywhere refused every unknown address for half an
 * hour — and the journal recorded this server as the author of every action.
 *
 * `x-forwarded-for` is passed on as the chain it arrived with (Next fills it with the socket's address
 * when a request has none; a proxy in front appends to it). **The backend trusts it only from this
 * server** — `server.tomcat.remoteip.internal-proxies` in `application.yml` — so a caller reaching Java
 * directly cannot choose the address it is counted under.
 */
export const callerHeaders = (incoming: HeaderReader | null): Record<string, string> => {
  const forwarded = incoming?.get("x-forwarded-for")?.trim();
  const userAgent = incoming?.get("user-agent")?.trim();
  return {
    ...(forwarded ? { "X-Forwarded-For": forwarded } : {}),
    ...(userAgent ? { "User-Agent": userAgent } : {}),
  };
};

export class HrisApiClient {
  private readonly BASE_URL: string =
    process.env.BACKEND_URL ||
    (() => {
      const issuer = new URL(publicConfig.auth.issuerUri);
      return issuer.origin;
    })();

  public async get<T>(path: string): Promise<T> {
    return this.request("GET", path);
  }

  public async post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request("POST", path, body);
  }

  public async postForm<T>(path: string, formData: FormData): Promise<T> {
    return this.requestForm<T>("POST", path, formData);
  }

  public async put<T, B = unknown>(path: string, body?: B): Promise<T> {
    return this.request<T, B>("PUT", path, body);
  }

  public async delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  public async patch<T, B = unknown>(path: string, body?: B): Promise<T> {
    return this.request<T, B>("PATCH", path, body);
  }

  /**
   * A POST whose **response headers** matter as well as its body.
   *
   * Login and refresh are the two: the backend answers them with a `Set-Cookie` carrying the
   * refresh token, and that header dies here unless somebody reads it. It used to — which is why
   * the refresh token never reached the browser, and why `/auth/refresh` sat unused with nothing
   * able to call it.
   */
  public async postWithResponse<T>(
    path: string,
    body?: Record<string, unknown>,
    extraHeaders?: Record<string, string>
  ): Promise<{ data: T; response: Response }> {
    const headers = await this.prepareHeaders(path);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    for (const [name, value] of Object.entries(extraHeaders ?? {})) headers.set(name, value);

    const response = await this.send(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers,
      cache: "no-store",
    });

    await this.checkResponseStatus(response);

    return { data: (await response.json()) as T, response };
  }

  /**
   * A passthrough for SCIM (ENTERPRISE_ACCESS_DESIGN.md § 4.2): the IdP's request as it came, its own bearer
   * token, the host's company named so Java can check it is the token's (A10). Nothing is logged here — the
   * `Authorization` header is a credential (R2 point 4).
   */
  public async scim(path: string, init: { method: string; body?: string; authorization?: string; contentType?: string; subdomain: string }): Promise<Response> {
    const headers = await this.prepareHeaders(path);
    headers.set("Accept", "application/scim+json, application/json");
    if (init.contentType) headers.set("Content-Type", init.contentType);
    if (init.authorization) headers.set("Authorization", init.authorization);
    headers.set("X-Company-Subdomain", init.subdomain);
    return this.send(path, { method: init.method, body: init.body, headers, cache: "no-store" });
  }

  /** A POST with no body either way and headers of its own — sign-out, which sends only the refresh cookie. */
  public async postNoContent(path: string, extraHeaders?: Record<string, string>): Promise<void> {
    const headers = await this.prepareHeaders(path);
    for (const [name, value] of Object.entries(extraHeaders ?? {})) headers.set(name, value);
    const response = await this.send(path, { method: "POST", headers, cache: "no-store" });
    await this.checkResponseStatus(response);
  }

  /**
   * Raw passthrough for endpoints that do not return JSON — exports, ICS feeds.
   *
   * `accept` matters: an endpoint declaring `produces = "text/calendar"` answers 406 to a request
   * that only accepts JSON, and the failure surfaces as a confusing 404 further up.
   */
  public async fetch(path: string, accept = "application/json"): Promise<Response> {
    const headers = await this.prepareHeaders(path);
    headers.set("Accept", accept);

    const response = await this.send(path, {
      headers,
      cache: "no-store",
    });

    await this.checkResponseStatus(response);

    return response;
  }

  /**
   * The same raw passthrough for a POST with a JSON body — the People export, whose request is the
   * whole table view (filters, columns, sort) and does not fit a query string. The body is returned
   * unread, so a large file streams through instead of being buffered here.
   */
  public async postForBinary(path: string, body: unknown, accept = "*/*"): Promise<Response> {
    const headers = await this.prepareHeaders(path);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", accept);

    const response = await this.send(path, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
      headers,
      cache: "no-store",
    });

    await this.checkResponseStatus(response);

    return response;
  }

  /**
   * The only place `fetch` is called. A throw here means the request never reached the backend —
   * it is down, the port is wrong, DNS failed — which is not a 500 from the API.
   */
  private async send(path: string, init: RequestInit): Promise<Response> {
    const response = await this.reach(path, init);
    // B1 (2026-11-18): an access token that expired is renewed here and the call made once more. A read from the
    // browser renewed itself already (`internalApiClient`); a server action did not, and its first try after the
    // expiry answered "An error occurred".
    if (response.status !== 401 || isPublicBackendPath(path)) return response;
    const sent = new Headers(init.headers);
    if (!sent.get("Authorization")) return response;
    const code = await response.clone().json().then((b: { code?: string }) => b?.code).catch(() => undefined);
    if (code !== "TOKEN_INVALID") return response;
    const renewed = await this.renewSession();
    if (!renewed) return response;
    sent.set("Authorization", `Bearer ${renewed}`);
    return this.reach(path, { ...init, headers: sent });
  }

  private async reach(path: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(this.BASE_URL + path, init);
    } catch (cause) {
      throw new BackendUnavailableError(
        `Cannot reach the API at ${this.BASE_URL} — is the backend running?`,
        { cause },
      );
    }
  }

  /**
   * Trades the refresh cookie for a new pair and writes it back — **only where cookies can be written** (a server
   * action, a route handler). In a server component the write throws, and nothing is traded: renewing there would spend
   * the refresh token the browser still holds, and its next request would be refused. Null when it could not renew.
   */
  private async renewSession(): Promise<string | null> {
    let store: Awaited<ReturnType<typeof cookies>>;
    try {
      store = await cookies();
    } catch {
      return null;
    }
    const refreshToken = store.get(REFRESH_COOKIE)?.value;
    const current = store.get(ACCESS_COOKIE)?.value ?? "";
    if (!refreshToken) return null;
    try {
      // Rewriting the access cookie as it stands answers whether this context may write cookies at all.
      store.set({ name: ACCESS_COOKIE, value: current, httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 30 * 24 * 60 * 60 });
    } catch {
      return null;
    }
    const pending = renewals.get(refreshToken);
    if (pending) return pending;
    const renewal = (async () => {
      const headers = new Headers({ Accept: "application/json", Cookie: `${REFRESH_COOKIE}=${refreshToken}` });
      for (const [name, value] of Object.entries(callerHeaders(await incomingHeaders()))) headers.set(name, value);
      const res = await this.reach("/auth/refresh", { method: "POST", headers, cache: "no-store" });
      if (!res.ok) return null;
      const data = (await res.json().catch(() => ({}))) as { accessToken?: string };
      if (!data.accessToken) return null;
      setSessionCookies({ cookies: store }, { accessToken: data.accessToken, refreshToken: setCookieValue(res, REFRESH_COOKIE) });
      return data.accessToken;
    })();
    renewals.set(refreshToken, renewal);
    try {
      return await renewal;
    } finally {
      setTimeout(() => renewals.delete(refreshToken), 5_000);
    }
  }

  private async request<T, B = unknown>(
    method: string,
    path: string,
    body?: object | B
  ): Promise<T> {
    const headers = await this.prepareHeaders(path);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    const response = await this.send(path, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers,
      cache: "no-store",
    });

    await this.checkResponseStatus(response);

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  private async requestForm<T>(
    method: string,
    path: string,
    formData: FormData
  ): Promise<T> {
    const headers = await this.prepareHeaders(path);
    headers.set("Accept", "application/json");

    const response = await this.send(path, {
      method,
      body: formData,
      headers,
      cache: "no-store",
    });

    await this.checkResponseStatus(response);

    return response.json();
  }

  private async prepareHeaders(path: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_COOKIE)?.value ?? "";
    const headers = new Headers();

    if (!isPublicBackendPath(path) && token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    for (const [name, value] of Object.entries(callerHeaders(await incomingHeaders()))) {
      headers.set(name, value);
    }
    // TEMPORARY — the ngrok tunnel; remove with config/backendTunnel.ts.
    for (const [name, value] of Object.entries(backendTunnelHeaders())) {
      headers.set(name, value);
    }

    return headers;
  }

  /**
   * One parse, one shape. Every branch below gets `code`, `fieldErrors`, `params` and the request id,
   * because
   * losing any of them here means it cannot be recovered further up: this is the narrowest point of
   * the pipe between Java and the browser.
   */
  private async checkResponseStatus(response: Response) {
    if (response.status >= 200 && response.status < 300) {
      return;
    }

    const body = response.headers.get("content-type")?.includes("application/json")
      ? await response.json().catch(() => ({}))
      : {};

    const init: ApiErrorInit = {
      status: response.status,
      code: body?.code ?? undefined,
      fieldErrors: body?.fieldErrors ?? undefined,
      params: Array.isArray(body?.params) ? body.params : undefined,
      requestId: response.headers.get("X-Request-Id") ?? undefined,
    };
    const message = body?.message ?? `HTTP ${response.status}`;

    switch (response.status) {
      case 400:
        throw new BadRequestError(message, init);
      case 401:
        throw new UnauthorizedError(message, init);
      case 403:
        throw new ForbiddenError(message, init);
      case 404:
        throw new NotFoundError(message, init);
      case 402:
        throw new NotEntitledError(message, init);
      case 409:
        throw new ConflictError(message, init);
      case 422:
        throw new ValidationError(message, init);
      default:
        throw new ServerError(message, init);
    }
  }
}

export const hrisApiClient = new HrisApiClient();
