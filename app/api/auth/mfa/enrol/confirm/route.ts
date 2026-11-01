import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import { clearMfaChallengeCookie, setSessionCookies } from "@/api/modules/auth/services/sessionCookies";
import { rememberCompany } from "@/api/modules/companyAddress";
import publicConfig from "@/config/publicConfig";
import { MFA_CHALLENGE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost } from "@/lib/companyAddress";

/** The first code of an enrolment inside a sign-in: the session opens, and the backup codes are shown once. */
export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const subdomain = host.kind === "company" ? host.subdomain : "";
  const challengeToken = (await cookies()).get(MFA_CHALLENGE_COOKIE)?.value ?? "";

  const verified = await hrisAuthSessionService.enrolAtSignInConfirm(
    challengeToken,
    typeof payload?.code === "string" ? payload.code : "",
    subdomain,
  );
  const res = NextResponse.json({ ok: true, backupCodes: verified.backupCodes ?? [] }, { status: 200 });
  setSessionCookies(res, verified.tokens);
  clearMfaChallengeCookie(res);
  rememberCompany(res, subdomain);
  return res;
});
