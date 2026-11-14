import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import { setMfaChallengeCookie, setSessionCookies } from "@/api/modules/auth/services/sessionCookies";
import { rememberCompany } from "@/api/modules/companyAddress";
import { secondStepPath } from "@/api/modules/sso";
import publicConfig from "@/config/publicConfig";
import { TRUSTED_DEVICE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost } from "@/lib/companyAddress";

/**
 * G1 "Join Acme": accepting an invitation with a password ends where a login ends — the session's cookies and the
 * welcome, or the second step's cookie and its route when the company requires a factor (sign-in-invitation).
 * A route handler, not an action: it sets cookies.
 */
export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const trusted = (await cookies()).get(TRUSTED_DEVICE_COOKIE)?.value;
  const result = await hrisAuthSessionService.acceptInvite(String(payload?.token ?? ""), String(payload?.password ?? ""), trusted);
  if (result.kind === "mfa") {
    const res = NextResponse.json({ ok: true, next: secondStepPath(result.mfa, "/welcome") }, { status: 200 });
    setMfaChallengeCookie(res, result.challengeToken, result.mfa);
    return res;
  }
  const res = NextResponse.json({ ok: true, next: "/welcome" }, { status: 200 });
  setSessionCookies(res, result.tokens);
  if (host.kind === "company") rememberCompany(res, host.subdomain);
  return res;
});
