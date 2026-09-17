import { InternalApiClient } from "@/components/clients/apiClient";

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { ok: boolean; status: number };

export class AuthService {
  public constructor(private readonly apiClient: InternalApiClient) {}

  public async login(payload: LoginRequest): Promise<LoginResponse> {
    return this.apiClient.post<LoginResponse>("/auth/login", payload);
  }

  /** Clears the session cookies on this browser. The route handler is what can reach them. */
  public async logout(): Promise<{ ok: boolean }> {
    return this.apiClient.post<{ ok: boolean }>("/auth/logout");
  }
}
