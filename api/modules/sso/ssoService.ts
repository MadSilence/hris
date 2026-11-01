import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { cookieFrom, refreshTokenFrom, type SessionTokens } from "@/api/modules/auth/services/hrisAuthSessionService";
import type { LoginResponse } from "@/api/modules/auth/dto";

/** Whether a company's login page offers its identity provider, and under whose name. */
export type PublicSso = { mode: "OFF" | "OPTIONAL" | "REQUIRED"; provider: "OKTA" | "ENTRA" | "OTHER" | null; protocol: "OIDC" | "SAML" | null };

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
      return await hrisApiClient.get<PublicSso>(`/public/company-sso/${encodeURIComponent(subdomain)}`);
    } catch {
      // A login page that cannot ask still shows the password form.
      return { mode: "OFF", provider: null, protocol: null };
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
