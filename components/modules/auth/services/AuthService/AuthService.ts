import { InternalApiClient } from "@/components/clients/apiClient";

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { ok: boolean; status: number };

export class AuthService {
  public constructor(private readonly apiClient: InternalApiClient) {}

  public async login(payload: LoginRequest): Promise<LoginResponse> {
    return this.apiClient.post<LoginResponse>("/auth/login", payload);
  }
}
