import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { refreshTokenFrom, type SessionTokens } from "@/api/modules/auth/services/hrisAuthSessionService";
import type { LoginResponse } from "@/api/modules/auth/dto";

/** Google and Microsoft: our own applications, one for every company (SIGN_IN_IMPLEMENTATION_DESIGN.md § 3). */
export type SharedProvider = "GOOGLE" | "MICROSOFT";

export const SHARED_PROVIDERS: readonly SharedProvider[] = ["GOOGLE", "MICROSOFT"];

export const isSharedProvider = (value: string | null | undefined): value is SharedProvider =>
  value === "GOOGLE" || value === "MICROSOFT";

/** What a round trip is for. The first three start signed out, the last two signed in. */
export type ProviderPurpose = "SIGN_IN" | "INVITE" | "SIGNUP" | "CONNECT" | "REAUTH";

export type ProviderStarted = { beginUrl: string; originBinding: string };

/** What `finish` came to on the origin: a session, the second step, or — Connect, re-authentication — the link alone. */
export type ProviderOutcome = { purpose: ProviderPurpose; returnTo: string | null } & (
  | { kind: "session"; tokens: SessionTokens }
  | { kind: "mfa"; mfa: "CHALLENGE" | "ENROL"; challengeToken: string }
  | { kind: "linked" }
  | { kind: "signup"; draft: string }
);

/**
 * The provider round trip through the BFF (§ 4.2). Java decides every step; this carries the values the browser's
 * cookies hold — the origin binding, the state's hash — and nothing else.
 */
class ProviderService {
  /** What registration offers (B1): every provider this installation is registered with. None when it cannot ask. */
  public async registrationProviders(): Promise<SharedProvider[]> {
    try {
      const names = await hrisApiClient.get<string[]>("/public/shared-providers");
      return names.filter(isSharedProvider);
    } catch {
      return [];
    }
  }

  public async start(body: {
    purpose: "SIGN_IN" | "INVITE" | "SIGNUP";
    provider: SharedProvider;
    subdomain: string | null;
    returnTo: string | null;
    inviteToken: string | null;
  }): Promise<ProviderStarted> {
    return hrisApiClient.post<ProviderStarted>("/auth/provider/start", body);
  }

  /** Signed in: connecting one's own account (Java asks for step-up first), or proving it is you again. */
  public async startForPerson(body: { purpose: "CONNECT" | "REAUTH"; provider: SharedProvider; returnTo: string | null }): Promise<ProviderStarted> {
    return hrisApiClient.post<ProviderStarted>("/auth/provider/person/start", body);
  }

  public async begin(ticket: string): Promise<{ authorizeUrl: string; stateHash: string }> {
    return hrisApiClient.post("/auth/provider/begin", { ticket });
  }

  /** `null`: the request is unknown and nothing can be sent back — the auth host's own page (E3). */
  public async callback(body: { code: string | null; state: string | null; error: string | null; stateCookie: string | null }): Promise<string | null> {
    const data = await hrisApiClient.post<{ redirectUrl: string | null }>("/auth/provider/callback", body);
    return data.redirectUrl ?? null;
  }

  public async finish(body: {
    handoff: string;
    originBinding: string | null;
    subdomain: string | null;
    trustedDevice: string | null;
  }): Promise<ProviderOutcome> {
    const { data, response } = await hrisApiClient.postWithResponse<LoginResponse>("/auth/provider/finish", { ...body });
    const purpose = (data.purpose ?? "SIGN_IN") as ProviderPurpose;
    const returnTo = data.returnTo ?? null;
    if (data.signupDraft) return { purpose, returnTo, kind: "signup", draft: data.signupDraft };
    if (data.mfa === "LINKED") return { purpose, returnTo, kind: "linked" };
    if ((data.mfa === "CHALLENGE" || data.mfa === "ENROL") && data.challengeToken) {
      return { purpose, returnTo, kind: "mfa", mfa: data.mfa, challengeToken: data.challengeToken };
    }
    return {
      purpose,
      returnTo,
      kind: "session",
      tokens: { accessToken: data.accessToken ?? "", refreshToken: refreshTokenFrom(response) },
    };
  }
}

export const providerService = new ProviderService();
