import { InternalApiClient } from "@/components/clients/apiClient";

export type LoginRequest = { email: string; password: string };
/** `next: "mfa"` — a second step comes before the session (MFA_DESIGN.md § 3.2). */
export type LoginResponse = { ok: boolean; status: number; next?: "mfa"; mfa?: "CHALLENGE" | "ENROL" };

export type MfaVerifyRequest = { code?: string; backupCode?: string; rememberDevice: boolean };

export class AuthService {
  public constructor(private readonly apiClient: InternalApiClient) {}

  public async login(payload: LoginRequest): Promise<LoginResponse> {
    return this.apiClient.post<LoginResponse>("/auth/login", payload);
  }

  /** The second step. The challenge itself is a cookie this page cannot read. */
  public async verifyMfa(payload: MfaVerifyRequest): Promise<{ ok: boolean; backupCodesLeft: number | null }> {
    return this.apiClient.post("/auth/mfa/verify", payload);
  }

  /** The company requires a factor the person has not got: the key to scan. */
  public async enrolAtSignInStart(): Promise<{ otpauthUri: string; secret: string }> {
    return this.apiClient.post("/auth/mfa/enrol/start");
  }

  public async enrolAtSignInConfirm(code: string): Promise<{ ok: boolean; backupCodes: string[] }> {
    return this.apiClient.post("/auth/mfa/enrol/confirm", { code });
  }

  /** Ends the session on the server, then clears this browser's cookies. */
  public async logout(): Promise<{ ok: boolean }> {
    return this.apiClient.post<{ ok: boolean }>("/auth/logout");
  }
}
