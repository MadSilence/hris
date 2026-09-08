import {
  ApiErrorInit,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "@/components/clients/exceptions";

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
 *
 * **It has to be a route that reaches Java, and this is the whole point.** It used to be
 * `/api/users/me`, which decodes the cookie locally with `decodeJwt` — no backend call, no signature
 * check, not even `exp`. It answered "alive" whenever an `access_token` cookie existed, in whatever
 * state, so the redirect below was unreachable for every revocation there is: a blocked account, a
 * terminated user, a rotated perm-hash, an expired token. Observed live — subject blocked,
 * `/auth/refresh` answering 401, and the browser sat on "403 Access denied" with the impersonation
 * banner still up. `/api/me/access` is a raw proxy that forwards the token as a Bearer, so a 401
 * from it is Java's answer and not ours. It is also the endpoint `useAccess` already keeps warm, and
 * it honours ETag/304, so asking again costs little.
 */
const SESSION_PROBE_PATH = "/api/me/access";
let sessionProbe: Promise<boolean> | null = null;

const REFRESH_PATH = "/api/auth/refresh";
let refreshInFlight: Promise<boolean> | null = null;

/**
 * Trades the refresh token for a new access token, once.
 *
 * Access tokens last 150 minutes; before this, every request after that simply failed and the user
 * was sent to /login with weeks of refresh validity unused. Single-flight on purpose: a page renders
 * a dozen queries at once, they all get 401 together, and a dozen concurrent refreshes would race —
 * the losers arriving with a token that has already been rotated away.
 *
 * A failure here is an answer, not an error: it means the refresh token is gone or no longer valid,
 * which is the case the login redirect is for.
 */
async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(REFRESH_PATH, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        // Cleared immediately rather than on a timer: the next 401 after a *failed* refresh should
        // try again on its own merits, and after a successful one there is nothing to reuse.
        setTimeout(() => {
          refreshInFlight = null;
        }, 0);
      });
  }
  return refreshInFlight;
}

/** Wrapped so tests can observe the redirect: jsdom's location is read-only. */
export const sessionNavigation = {
  redirectToLogin() {
    window.location.assign("/login");
  },
};

/**
 * Answers "is the session definitely gone", not "did the probe succeed".
 *
 * The difference matters: the probe fails when the backend is down too, and reading that as a dead
 * session logged people out of a perfectly good one every time the API blinked. A network failure
 * is not an answer, so we keep them where they are — a 401 on the probe is.
 */
async function isSessionAlive(): Promise<boolean> {
  if (!sessionProbe) {
    sessionProbe = fetch(SESSION_PROBE_PATH, { credentials: "same-origin", cache: "no-store" })
      // 304 counts as alive: the probe honours If-None-Match and an unchanged answer is still an
      // answer. Anything other than a 401 is not a verdict on the session.
      .then((response) => response.ok || response.status !== 401)
      .catch(() => true);
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
    let response = await fetch(url, { ...init, credentials: "same-origin" });

    if (response.status === 401 && (await this.shouldRetryAfterRefresh(path))) {
      response = await fetch(url, { ...init, credentials: "same-origin" });
    }

    await this.throwIfError(response, path, init?.method ?? "GET");
    return response;
  }

  /**
   * Whether this 401 is worth one renewal and a replay.
   *
   * Not on the login page, and never for the refresh call itself — a refresh that 401s is the end of
   * the line, and retrying it would be a loop.
   */
  private async shouldRetryAfterRefresh(path: string): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (window.location.pathname.startsWith("/login")) return false;
    if (path.startsWith("/auth/")) return false;
    return refreshSession();
  }

  private async request<T>(method: string, path: string, body?: object): Promise<T> {
    const url = this.basePath + this.apiPath + path;

    const headers: Record<string, string> = {};
    const hasBody = body !== undefined;
    if (hasBody) headers["Content-Type"] = "application/json";

    const send = () =>
      fetch(url, {
        method,
        headers,
        body: hasBody ? JSON.stringify(body) : undefined,
        credentials: "same-origin",
      });

    let response = await send();

    // An expired access token is not a dead session — it is a token that needs renewing. Try once,
    // then replay; only if the renewal itself fails does the 401 mean what it used to mean.
    if (response.status === 401 && (await this.shouldRetryAfterRefresh(path))) {
      response = await send();
    }

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
    let code: string | undefined;
    let fieldErrors: Record<string, string> | undefined;
    let params: string[] | undefined;
    const ct = response.headers.get("content-type") || "";
    try {
      if (ct.includes("application/json")) {
        const data = await response.json().catch(() => ({}));
        message = (data && (data.message || data.error)) ?? undefined;
        code = data?.code ?? undefined;
        fieldErrors = data?.fieldErrors ?? undefined;
        params = Array.isArray(data?.params) ? data.params : undefined;
      } else {
        const text = await response.text().catch(() => "");
        message = text?.trim();
      }
    } catch {
      // ignore parsing errors, fall back to generic message
    }

    const friendly = message || `HTTP ${response.status} while fetching ${path}`;
    const init: ApiErrorInit = {
      status: response.status,
      code,
      fieldErrors,
      params,
      requestId: response.headers.get("X-Request-Id") ?? undefined,
    };

    switch (response.status) {
      case 400:
        throw new BadRequestError(friendly, init);
      case 404:
        throw new NotFoundError(friendly, init);
      case 401: {
        // Redirect only if the session is really dead (see the note above SESSION_PROBE_PATH). A
        // stale in-flight request still throws, so the caller can refetch with the current token.
        //
        // An impersonated session whose subject is blocked ends here, at the login screen, and there
        // is no gentler answer available: the perm-hash is checked on every request, so the access
        // token is already rejected, and the only refresh token the browser holds is the subject's —
        // the actor's was deliberately replaced when the impersonation started. Dropping back into
        // the actor's session would mean keeping their renewable credential alive alongside the
        // subject's, which is the thing that fix removed.
        const onLoginPage =
          typeof window === "undefined" || window.location.pathname.startsWith("/login");
        const isProbe = path === SESSION_PROBE_PATH.replace("/api", "");
        if (!onLoginPage && !isProbe && !(await isSessionAlive())) {
          sessionNavigation.redirectToLogin();
        }
        throw new UnauthorizedError(friendly, init);
      }
      case 403:
        if (typeof window !== "undefined" && method !== "GET") {
          window.dispatchEvent(new CustomEvent("hris:forbidden", { detail: friendly }));
        }
        throw new ForbiddenError(friendly, init);
      case 409:
        throw new ConflictError(friendly, init);
      case 422:
        throw new ValidationError(friendly, init);
      case 429:
      case 500:
      case 502:
      case 503:
      default:
        throw new ServerError(friendly, init);
    }
  }
}
