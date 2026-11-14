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

  /** The step, and the days a device would be remembered — 0 when *Remember this device* is not offered. */
  public async describeMfaChallenge(): Promise<{ purpose: "SIGN_IN" | "ENROL_AT_SIGN_IN"; rememberDays: number }> {
    return this.apiClient.get("/auth/mfa/challenge");
  }

  /** The company requires a factor the person has not got: the key to scan. */
  public async enrolAtSignInStart(): Promise<{ otpauthUri: string; secret: string }> {
    return this.apiClient.post("/auth/mfa/enrol/start");
  }

  public async enrolAtSignInConfirm(code: string): Promise<{ ok: boolean; backupCodes: string[] }> {
    return this.apiClient.post("/auth/mfa/enrol/confirm", { code });
  }

  /** G1 "Join Acme": accepts an invitation with a password; answers where the browser goes next. */
  public async acceptInvite(token: string, password: string): Promise<{ ok: boolean; next: string }> {
    return this.apiClient.post("/auth/invite/accept", { token, password });
  }

  /** "Email me a login code" (C10): the same answer whether or not the address can log in here. */
  public async loginCodeSend(email: string): Promise<{ ok: boolean }> {
    return this.apiClient.post("/auth/login-code", { email });
  }

  /** C10: the typed code; answers where the browser goes next (the app, or the second step). */
  public async loginCodeVerify(email: string, code: string, next: string): Promise<{ ok: boolean; next: string }> {
    return this.apiClient.post("/auth/login-code/verify", { email, code, next });
  }

  /** Ends the session on the server, then clears this browser's cookies. */
  public async logout(): Promise<{ ok: boolean }> {
    return this.apiClient.post<{ ok: boolean }>("/auth/logout");
  }
}
