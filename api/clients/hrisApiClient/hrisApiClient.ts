import {
  ApiErrorInit,
  BackendUnavailableError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "@/components/clients/exceptions";
import { cookies } from "next/headers";
import publicConfig from "@/config/publicConfig";
import { isPublicBackendPath } from "@/config/security/publicBackendPaths";

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
   * The only place `fetch` is called. A throw here means the request never reached the backend —
   * it is down, the port is wrong, DNS failed — which is not a 500 from the API.
   */
  private async send(path: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(this.BASE_URL + path, init);
    } catch (cause) {
      throw new BackendUnavailableError(
        `Cannot reach the API at ${this.BASE_URL} — is the backend running?`,
        { cause },
      );
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
    const token = cookieStore.get("access_token")?.value ?? "";
    const headers = new Headers();

    if (!isPublicBackendPath(path) && token) {
      headers.set("Authorization", `Bearer ${token}`);
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
