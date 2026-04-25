import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "@/components/clients/exceptions";
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

  public async fetch(path: string): Promise<Response> {
    const headers = await this.prepareHeaders(path);
    headers.set("Accept", "application/json");

    const response = await fetch(this.BASE_URL + path, {
      headers,
      cache: "no-store",
    });

    await this.checkResponseStatus(response);

    return response;
  }

  private async request<T, B = unknown>(
    method: string,
    path: string,
    body?: object | B
  ): Promise<T> {
    const headers = await this.prepareHeaders(path);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    const response = await fetch(this.BASE_URL + path, {
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

    const response = await fetch(this.BASE_URL + path, {
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

  private async checkResponseStatus(response: Response) {
    if (response.status >= 200 && response.status < 300) {
      return;
    }

    if (response.status === 400) {
      const errorResponse = await response.json().catch(() => ({}));
      throw new BadRequestError(errorResponse?.message ?? "Bad Request");
    }

    if (response.status === 401) {
      const errorResponse = await response.json().catch(() => ({}));
      throw new UnauthorizedError(errorResponse?.message ?? "Unauthorized");
    }

    if (response.status === 403) {
      const errorResponse = await response.json().catch(() => ({}));
      throw new ForbiddenError(errorResponse?.message ?? "Forbidden");
    }

    if (response.status === 404) {
      throw new NotFoundError("Not Found");
    }

    throw new Error(`HTTP ${response.status}`);
  }
}

export const hrisApiClient = new HrisApiClient();
