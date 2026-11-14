import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import { setMfaChallengeCookie, setSessionCookies } from "@/api/modules/auth/services/sessionCookies";
import { rememberCompany } from "@/api/modules/companyAddress";
import { secondStepPath } from "@/api/modules/sso";
import { ApiError } from "@/components/clients/exceptions";
import publicConfig from "@/config/publicConfig";
import { EMAIL_CODE_COOKIE, TRUSTED_DEVICE_COOKIE } from "@/config/security/sessionCookieNames";
import { APP_HOME, parseHost, requestHost, requestOrigin } from "@/lib/companyAddress";

/**
 * `GET <company>/api/auth/login-code/link?token=…` — "Log in with one click" in M16. It works only in the browser that
 * asked for the code; anywhere else the login says so, and the code can still be typed there.
 */
export const GET = async (req: NextRequest) => {
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const origin = requestOrigin(req.headers, publicConfig.web);
  const to = (path: string) => NextResponse.redirect(new URL(path, origin), 303);
  if (host.kind !== "company") return to("/login");
  const store = await cookies();
  try {
    const result = await hrisAuthSessionService.loginCodeLogIn(
      { subdomain: host.subdomain, linkToken: req.nextUrl.searchParams.get("token") ?? "", browserToken: store.get(EMAIL_CODE_COOKIE)?.value ?? "" },
      store.get(TRUSTED_DEVICE_COOKIE)?.value,
    );
    if (result.kind === "mfa") {
      const res = to(secondStepPath(result.mfa, APP_HOME));
      setMfaChallengeCookie(res, result.challengeToken, result.mfa);
      return res;
    }
    const res = to(APP_HOME);
    setSessionCookies(res, result.tokens);
    rememberCompany(res, host.subdomain);
    return res;
  } catch (error) {
    const otherBrowser = error instanceof ApiError && error.code === "AUTH00024";
    return to(otherBrowser ? "/login?code=other-browser" : "/login?code=expired");
  }
};
