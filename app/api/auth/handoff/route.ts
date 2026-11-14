import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import { setMfaChallengeCookie, setSessionCookies } from "@/api/modules/auth/services/sessionCookies";
import { rememberCompany } from "@/api/modules/companyAddress";
import { secondStepPath } from "@/api/modules/sso";
import publicConfig from "@/config/publicConfig";
import { TRUSTED_DEVICE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost, requestOrigin } from "@/lib/companyAddress";

/**
 * `GET <company>/api/auth/handoff?token=…` — the end of a registration that happened on the root (§ 6.2). The token
 * opens the owner's session here, on the company's own address, or its second step; then `/setup` (the app's gate
 * sends a set-up company on to its home). A dead or foreign token lands on the login.
 */
export const GET = async (req: NextRequest) => {
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const origin = requestOrigin(req.headers, publicConfig.web);
  const to = (path: string) => NextResponse.redirect(new URL(path, origin), 303);
  if (host.kind !== "company") return to("/login");
  try {
    const trusted = (await cookies()).get(TRUSTED_DEVICE_COOKIE)?.value;
    const result = await hrisAuthSessionService.handoff(req.nextUrl.searchParams.get("token") ?? "", host.subdomain, trusted);
    if (result.kind === "mfa") {
      const res = to(secondStepPath(result.mfa, "/setup"));
      setMfaChallengeCookie(res, result.challengeToken, result.mfa);
      return res;
    }
    const res = to("/setup");
    setSessionCookies(res, result.tokens);
    rememberCompany(res, host.subdomain);
    return res;
  } catch {
    return to("/login");
  }
};
