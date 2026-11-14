import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import { setMfaChallengeCookie, setSessionCookies } from "@/api/modules/auth/services/sessionCookies";
import { rememberCompany } from "@/api/modules/companyAddress";
import { secondStepPath } from "@/api/modules/sso";
import publicConfig from "@/config/publicConfig";
import { EMAIL_CODE_COOKIE, TRUSTED_DEVICE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost, safeReturnPath } from "@/lib/companyAddress";

/** C10: the typed code. A session, or the second step — answered as where the browser goes next. */
export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const subdomain = host.kind === "company" ? host.subdomain : "";
  const store = await cookies();
  const result = await hrisAuthSessionService.loginCodeLogIn(
    { subdomain, email: String(payload?.email ?? ""), code: String(payload?.code ?? ""), browserToken: store.get(EMAIL_CODE_COOKIE)?.value ?? "" },
    store.get(TRUSTED_DEVICE_COOKIE)?.value,
  );
  const next = safeReturnPath(typeof payload?.next === "string" ? payload.next : null);
  if (result.kind === "mfa") {
    const res = NextResponse.json({ ok: true, next: secondStepPath(result.mfa, next) }, { status: 200 });
    setMfaChallengeCookie(res, result.challengeToken, result.mfa);
    return res;
  }
  const res = NextResponse.json({ ok: true, next }, { status: 200 });
  setSessionCookies(res, result.tokens);
  rememberCompany(res, subdomain);
  return res;
});
