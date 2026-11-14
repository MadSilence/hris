import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { cookieFrom, refreshTokenFrom, type SessionTokens } from "@/api/modules/auth/services/hrisAuthSessionService";
import type { LoginResponse } from "@/api/modules/auth/dto";
import { isSharedProvider, type SharedProvider } from "@/api/modules/provider/providerService";

/**
 * Whether a company's login page offers its identity provider, and under whose name — and which of Google and Microsoft
 * it shows (configured here, allowed by the company, and the company's SSO not required; S6).
 */
export type PublicSso = {
  mode: "OFF" | "OPTIONAL" | "REQUIRED";
  provider: "OKTA" | "ENTRA" | "OTHER" | "GOOGLE_WORKSPACE" | "MICROSOFT_365" | null;
  protocol: "OIDC" | "SAML" | null;
  sharedProviders: SharedProvider[];
};

/** What the IdP's answer came to: a session, a second step, or — for Connect — only the link. */
export type SsoOutcome =
  | { kind: "session"; tokens: SessionTokens }
  | { kind: "mfa"; mfa: "CHALLENGE" | "ENROL"; challengeToken: string }
  | { kind: "linked" };

const outcome = (data: LoginResponse, response: Response): SsoOutcome => {
  if (data.mfa === "LINKED") return { kind: "linked" };
  if ((data.mfa === "CHALLENGE" || data.mfa === "ENROL") && data.challengeToken) {
    return { kind: "mfa", mfa: data.mfa, challengeToken: data.challengeToken };
  }
  return { kind: "session", tokens: { accessToken: data.accessToken ?? "", refreshToken: refreshTokenFrom(response) } };
};

/** Single sign-on through the BFF (ENTERPRISE_ACCESS_DESIGN.md § 4.4). Java decides; this only carries. */
class SsoService {
  public async publicSso(subdomain: string): Promise<PublicSso> {
    try {
      const read = await hrisApiClient.get<PublicSso>(`/public/company-sso/${encodeURIComponent(subdomain)}`);
      // One button per provider: the company's own Workspace or Microsoft 365 is the company button, not a second one.
      const domain = read.provider === "GOOGLE_WORKSPACE" ? "GOOGLE" : read.provider === "MICROSOFT_365" ? "MICROSOFT" : null;
      const sharedProviders = (read.sharedProviders ?? []).filter(isSharedProvider)
        .filter((p) => read.mode === "OFF" || p !== domain);
      return { ...read, sharedProviders };
    } catch {
      // A login page that cannot ask still shows the password form.
      return { mode: "OFF", provider: null, protocol: null, sharedProviders: [] };
    }
  }

  public async start(subdomain: string, returnTo: string): Promise<{ redirectUrl: string; stateHash: string }> {
    return hrisApiClient.post("/auth/sso/start", { subdomain, returnTo });
  }

  /** Connect — the signed-in person links their own account (R1.3). */
  public async connect(returnTo: string): Promise<{ redirectUrl: string; stateHash: string }> {
    return hrisApiClient.post("/auth/sso/connect/start", { returnTo });
  }

  public async callback(body: {
    subdomain: string;
    code: string | null;
    state: string | null;
    iss: string | null;
    stateCookie: string | null;
    trustedDevice: string | null;
  }): Promise<SsoOutcome> {
    const { data, response } = await hrisApiClient.postWithResponse<LoginResponse>("/auth/sso/callback", { ...body });
    return outcome(data, response);
  }

  public async samlAcs(body: { subdomain: string; samlResponse: string; trustedDevice: string | null }): Promise<SsoOutcome> {
    const { data, response } = await hrisApiClient.postWithResponse<LoginResponse>("/auth/saml/acs", { ...body });
    return outcome(data, response);
  }

  public async samlMetadata(subdomain: string): Promise<Response> {
    return hrisApiClient.fetch(`/public/saml-metadata/${encodeURIComponent(subdomain)}`, "application/samlmetadata+xml");
  }
}

export const ssoService = new SsoService();
export { cookieFrom };
