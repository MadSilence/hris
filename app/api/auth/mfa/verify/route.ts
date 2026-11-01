import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import {
  clearMfaChallengeCookie,
  setSessionCookies,
  setTrustedDeviceCookie,
} from "@/api/modules/auth/services/sessionCookies";
import { rememberCompany } from "@/api/modules/companyAddress";
import publicConfig from "@/config/publicConfig";
import { MFA_CHALLENGE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost } from "@/lib/companyAddress";

/**
 * The second step of a sign-in: a code or a backup code against the challenge in `__Host-mfa`. On
 * success the session's cookies are set, the challenge cookie goes, and — if asked and allowed — the
 * device is remembered. A wrong code keeps the challenge: five tries, then sign in again.
 */
export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const subdomain = host.kind === "company" ? host.subdomain : "";
  const challengeToken = (await cookies()).get(MFA_CHALLENGE_COOKIE)?.value ?? "";

  const verified = await hrisAuthSessionService.verifyMfa({
    challengeToken,
    code: typeof payload?.code === "string" ? payload.code : undefined,
    backupCode: typeof payload?.backupCode === "string" ? payload.backupCode : undefined,
    rememberDevice: payload?.rememberDevice === true,
    subdomain,
  });

  const res = NextResponse.json({ ok: true, backupCodesLeft: verified.backupCodesLeft ?? null }, { status: 200 });
  setSessionCookies(res, verified.tokens);
  clearMfaChallengeCookie(res);
  if (verified.trustedDeviceToken) setTrustedDeviceCookie(res, verified.trustedDeviceToken);
  rememberCompany(res, subdomain);
  return res;
});
