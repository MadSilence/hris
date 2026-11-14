import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { LoginRequest, LoginResponse } from "@/api/modules/auth/dto";
import { REFRESH_COOKIE, TRUSTED_DEVICE_COOKIE } from "@/config/security/sessionCookieNames";

/** The name the backend uses for its refresh cookie, on both the way in and the way out. */
export { REFRESH_COOKIE };

export type SessionTokens = {
  accessToken: string;
  /** Absent when the backend chose not to rotate the refresh token on this call. */
  refreshToken?: string;
};

/**
 * What a password comes to: a session, or a second step first (MFA_DESIGN.md § 3.2). A challenge carries
 * no token that opens anything; its value goes into the `__Host-mfa` cookie, never to the page.
 */
export type SignInResult =
  | { kind: "session"; tokens: SessionTokens }
  | { kind: "mfa"; mfa: "CHALLENGE" | "ENROL"; challengeToken: string };

/** A challenge answered: the session, a remembered device if one was asked for, what the screen should say. */
export type MfaVerified = {
  tokens: SessionTokens;
  trustedDeviceToken?: string;
  backupCodesLeft?: number;
  backupCodes?: string[];
};

/** One cookie's value out of the backend's `Set-Cookie` header(s). */
export const cookieFrom = (response: Response, name: string): string | undefined => {
  const header = response.headers.get("set-cookie");
  if (!header) return undefined;

  const match = new RegExp(`(?:^|,\\s*)${name.replace(/[-]/g, "\\-")}=([^;]*)`).exec(header);
  const value = match?.[1];
  // A logout answers with the same cookie emptied; an empty value is not a token.
  return value ? value : undefined;
};

/**
 * Reads the refresh token out of the backend's `Set-Cookie`.
 *
 * The backend answers login and refresh with an httpOnly cookie — addressed to whoever made the
 * request, which is this server, not the browser. Nothing forwarded it, so the browser never had a
 * refresh token and `POST /auth/refresh` had no possible caller. Pulling the value out here is what
 * lets the route set it as a cookie of our own.
 */
export const refreshTokenFrom = (response: Response): string | undefined => cookieFrom(response, REFRESH_COOKIE);

/** A registration's details form, after the code: where the company lives and the token that opens its session there. */
export type Registered = { subdomain: string; handoffToken: string };

/** B3: what a provider said about the person registering. */
export type ProviderDraft = { provider: "GOOGLE" | "MICROSOFT"; email: string; firstName: string | null; lastName: string | null };

class HrisAuthSessionService {
  /** B1 → B2: a six-digit code to the address (sign-in-registration). `browserToken` is the `__Host-code` cookie. */
  public async registrationCode(email: string, browserToken: string): Promise<void> {
    await hrisApiClient.post<void>("/auth/register/code", { email, browserToken });
  }

  /** B2 → B2a: the code was right; a draft token for the details form. */
  public async registrationVerify(email: string, code: string, browserToken: string): Promise<string> {
    const data = await hrisApiClient.post<{ draftToken: string }>("/auth/register/verify", { email, code, browserToken });
    return data.draftToken;
  }

  /** B2a: the company, its owner, and the handoff to its address. */
  public async registrationComplete(body: {
    draftToken: string;
    firstName: string;
    lastName: string;
    companyName: string;
    password: string;
  }): Promise<Registered> {
    return hrisApiClient.post<Registered>("/auth/register/complete", body);
  }

  /** B3's read: who the provider says this is, while the draft lives (`AUTH00025` once it has run out — B3a). */
  public async registrationProviderDraft(draftToken: string): Promise<ProviderDraft> {
    return hrisApiClient.post<ProviderDraft>("/auth/register/provider-draft", { draftToken });
  }

  /** B3: the company from the draft, and the handoff to its address. No password (S7). */
  public async registrationProviderComplete(body: { draftToken: string; firstName: string; lastName: string; companyName: string }): Promise<Registered> {
    return hrisApiClient.post<Registered>("/auth/register/provider-complete", body);
  }

  /** C10: a login code to the address, if it can log in here — the same answer either way. */
  public async loginCodeSend(subdomain: string, email: string, browserToken: string): Promise<void> {
    await hrisApiClient.post<void>("/auth/login-code", { subdomain, email, browserToken });
  }

  /** C10: the code typed, or (`linkToken`) the email's one-click link — then exactly what follows a password. */
  public async loginCodeLogIn(
    body: { subdomain: string; browserToken: string } & ({ email: string; code: string } | { linkToken: string }),
    trustedDeviceToken?: string,
  ): Promise<SignInResult> {
    const path = "linkToken" in body ? "/auth/login-code/link" : "/auth/login-code/verify";
    const { data, response } = await hrisApiClient.postWithResponse<LoginResponse>(
      path,
      { ...body },
      trustedDeviceToken ? { Cookie: `${TRUSTED_DEVICE_COOKIE}=${trustedDeviceToken}` } : undefined,
    );
    if ((data.mfa === "CHALLENGE" || data.mfa === "ENROL") && data.challengeToken) {
      return { kind: "mfa", mfa: data.mfa, challengeToken: data.challengeToken };
    }
    return { kind: "session", tokens: { accessToken: data.accessToken ?? "", refreshToken: refreshTokenFrom(response) } };
  }

  /** Accepts an invitation with a password: a session, or the second step when the company requires one (G1). */
  public async acceptInvite(token: string, password: string, trustedDeviceToken?: string): Promise<SignInResult> {
    const { data, response } = await hrisApiClient.postWithResponse<LoginResponse>(
      "/auth/invite/accept",
      { token, password },
      trustedDeviceToken ? { Cookie: `${TRUSTED_DEVICE_COOKIE}=${trustedDeviceToken}` } : undefined,
    );
    if ((data.mfa === "CHALLENGE" || data.mfa === "ENROL") && data.challengeToken) {
      return { kind: "mfa", mfa: data.mfa, challengeToken: data.challengeToken };
    }
    return { kind: "session", tokens: { accessToken: data.accessToken ?? "", refreshToken: refreshTokenFrom(response) } };
  }

  /** Redeems a handoff on the company's own address: a session, or the second step (SIGN_IN_IMPLEMENTATION_DESIGN.md § 6.2). */
  public async handoff(token: string, subdomain: string, trustedDeviceToken?: string): Promise<SignInResult> {
    const { data, response } = await hrisApiClient.postWithResponse<LoginResponse>(
      "/auth/handoff",
      { token, subdomain },
      trustedDeviceToken ? { Cookie: `${TRUSTED_DEVICE_COOKIE}=${trustedDeviceToken}` } : undefined,
    );
    if ((data.mfa === "CHALLENGE" || data.mfa === "ENROL") && data.challengeToken) {
      return { kind: "mfa", mfa: data.mfa, challengeToken: data.challengeToken };
    }
    return { kind: "session", tokens: { accessToken: data.accessToken ?? "", refreshToken: refreshTokenFrom(response) } };
  }

  /**
   * Signs in with a password. The remembered-device cookie travels with it, so a device remembered at a
   * previous sign-in can skip the code (M1) — it is the backend that decides.
   */
  public async login(payload: LoginRequest, trustedDeviceToken?: string): Promise<SignInResult> {
    // Rebuilt from the fields it declares: the backend refuses an unknown property, and the browser's
    // body is not what decides the company.
    const { data, response } = await hrisApiClient.postWithResponse<LoginResponse>(
      "/auth/login",
      { email: payload.email, password: payload.password, subdomain: payload.subdomain },
      trustedDeviceToken ? { Cookie: `${TRUSTED_DEVICE_COOKIE}=${trustedDeviceToken}` } : undefined,
    );
    if ((data.mfa === "CHALLENGE" || data.mfa === "ENROL") && data.challengeToken) {
      return { kind: "mfa", mfa: data.mfa, challengeToken: data.challengeToken };
    }
    return { kind: "session", tokens: { accessToken: data.accessToken ?? "", refreshToken: refreshTokenFrom(response) } };
  }

  /** Answers a sign-in challenge with a code or a backup code. */
  public async verifyMfa(body: {
    challengeToken: string;
    code?: string;
    backupCode?: string;
    rememberDevice: boolean;
    subdomain: string;
  }): Promise<MfaVerified> {
    const { data, response } = await hrisApiClient.postWithResponse<LoginResponse>("/auth/mfa/verify", { ...body });
    return {
      tokens: { accessToken: data.accessToken ?? "", refreshToken: refreshTokenFrom(response) },
      trustedDeviceToken: cookieFrom(response, TRUSTED_DEVICE_COOKIE),
      backupCodesLeft: data.backupCodesLeft ?? undefined,
    };
  }

  /** The company requires a factor the person has not got: the key to scan. */
  /**
   * What the second step's screen shows before anything is typed: the step, and for how many days *Remember this
   * device* would remember — 0 when it is not offered (the company does not allow it, or a System Owner).
   */
  public async describeMfaChallenge(challengeToken: string, subdomain: string): Promise<{ purpose: "SIGN_IN" | "ENROL_AT_SIGN_IN"; rememberDays: number }> {
    const { data } = await hrisApiClient.postWithResponse<{ purpose: "SIGN_IN" | "ENROL_AT_SIGN_IN"; rememberDays: number }>(
      "/auth/mfa/challenge",
      { challengeToken, subdomain },
    );
    return data;
  }

  public async enrolAtSignInStart(challengeToken: string, subdomain: string): Promise<{ otpauthUri: string; secret: string }> {
    const { data } = await hrisApiClient.postWithResponse<{ otpauthUri: string; secret: string }>(
      "/auth/mfa/enrol-at-sign-in/start",
      { challengeToken, subdomain },
    );
    return data;
  }

  /** The first code: the factor is on, the session opens, and the backup codes are shown once. */
  public async enrolAtSignInConfirm(challengeToken: string, code: string, subdomain: string): Promise<MfaVerified> {
    const { data, response } = await hrisApiClient.postWithResponse<LoginResponse>(
      "/auth/mfa/enrol-at-sign-in/confirm",
      { challengeToken, code, subdomain },
    );
    return {
      tokens: { accessToken: data.accessToken ?? "", refreshToken: refreshTokenFrom(response) },
      backupCodes: data.backupCodes ?? [],
    };
  }

  /**
   * Exchanges a refresh token for a new pair.
   *
   * The backend reads the token from a cookie on the request, so it is sent as one — this server is
   * acting on the browser's behalf and has to look like the browser to the API.
   */
  public async refresh(refreshToken: string): Promise<SessionTokens> {
    const { data, response } = await hrisApiClient.postWithResponse<LoginResponse>(
      "/auth/refresh",
      undefined,
      { Cookie: `${REFRESH_COOKIE}=${refreshToken}` }
    );
    return { accessToken: data.accessToken ?? "", refreshToken: refreshTokenFrom(response) };
  }

  /**
   * Ends the session on the server. Before sessions lived there (R1.1) sign-out cleared this browser's
   * cookies and nothing else: a copied refresh token kept working for its whole life.
   */
  public async logout(refreshToken: string): Promise<void> {
    await hrisApiClient.postNoContent("/auth/logout", { Cookie: `${REFRESH_COOKIE}=${refreshToken}` });
  }
}

export const hrisAuthSessionService = new HrisAuthSessionService();
