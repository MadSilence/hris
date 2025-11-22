import { BadRequestError } from "@/components/clients/exceptions";
import { cookies } from "next/headers";

export class HrisApiClient {
  private readonly BASE_URL = "http://localhost:8081";

  public async get<T>(path: string): Promise<T> {
    return this.request("GET", path);
  }

  public async post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    console.log(path);
    return this.request("POST", path, body);
  }

  public async put<T, B = unknown>(path: string, body?: B): Promise<T> {
    return this.request<T, B>("PUT", path, body);
  }

  public async fetch(path: string): Promise<Response> {
    const headers = await this.prepareHeaders();

    const response = await fetch(this.BASE_URL + path, {
      headers: headers,
      cache: "no-store"
    });

    await this.checkResponseStatus(response);

    return response;
  }

  private async request<T, B = unknown>(method: string, path: string, body?: object | B): Promise<T> {
    const headers = await this.prepareHeaders();
    headers.set("Content-Type", "application/json");
    const response = await fetch(this.BASE_URL + path, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: headers,
      cache: "no-store",
    });

    await this.checkResponseStatus(response);

    return response.json();
  }

  private async prepareHeaders() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value ?? "";
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${token}`);
    return headers;
  }

  private async checkResponseStatus(response: Response) {
    switch (response.status) {
      case 200: {
        return;
      }
      case 400: {
        const errorResponse = await response.json();
        throw new BadRequestError(errorResponse.message);
      }
      default: {
        throw new Error();
      }
    }
  }
}

export const hrisApiClient = new HrisApiClient();
