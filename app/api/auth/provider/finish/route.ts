import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { setMfaChallengeCookie, setSessionCookies } from "@/api/modules/auth/services/sessionCookies";
import { rememberCompany } from "@/api/modules/companyAddress";
import { backPage, dropCookie, failedPage, providerService } from "@/api/modules/provider";
import { secondStepPath } from "@/api/modules/sso";
import { ApiError } from "@/components/clients/exceptions";
import publicConfig from "@/config/publicConfig";
import { PROVIDER_BACK_COOKIE, PROVIDER_ORIGIN_COOKIE, SIGNUP_PROVIDER_COOKIE, TRUSTED_DEVICE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost, safeReturnPath, requestOrigin } from "@/lib/companyAddress";

/** `IdentityBusinessError.PROVIDER_ACCOUNT_IN_USE`: the account is somebody else's here (I9). */
const ACCOUNT_IN_USE = "IDN00013";

/**
 * Back on the origin (SIGN_IN_IMPLEMENTATION_DESIGN.md § 4.2). With a handoff, Java spends it only here and only with
 * this browser's `__Host-provider-origin`, then does what the round trip was for: a session and the page the person
 * was going to (an invitation's `/welcome`), the second step, or — Connect, re-authentication — back to the page it
 * started from. Without one, the provider refused on the way: back to the page the button was on.
 */
export const GET = async (req: NextRequest) => {
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const origin = requestOrigin(req.headers, publicConfig.web);
  const params = req.nextUrl.searchParams;
  const store = await cookies();
  const to = (path: string) => {
    const res = NextResponse.redirect(new URL(path, origin), 303);
    dropCookie(res, PROVIDER_ORIGIN_COOKIE);
    dropCookie(res, PROVIDER_BACK_COOKIE);
    return res;
  };
  const failed = (inUse: boolean) => to(failedPage(backPage(store.get(PROVIDER_BACK_COOKIE)?.value), params.get("p"), inUse));

  const handoff = params.get("h");
  if (!handoff) return failed(false);
  try {
    const result = await providerService.finish({
      handoff,
      originBinding: store.get(PROVIDER_ORIGIN_COOKIE)?.value ?? null,
      subdomain: host.kind === "company" ? host.subdomain : null,
      trustedDevice: store.get(TRUSTED_DEVICE_COOKIE)?.value ?? null,
    });
    if (result.kind === "signup") {
      // B3 asks for the company; the draft waits in a cookie of the root's own, never in the address bar.
      const res = to("/trial");
      res.cookies.set({ name: SIGNUP_PROVIDER_COOKIE, value: result.draft, httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 10 * 60 });
      return res;
    }
    if (result.kind === "linked") {
      const page = safeReturnPath(result.returnTo ?? "/preferences");
      const mark = result.purpose === "REAUTH" ? "confirmed" : "connected";
      return to(`${page}${page.includes("?") ? "&" : "?"}provider=${mark}`);
    }
    if (result.kind === "mfa") {
      const res = to(secondStepPath(result.mfa, result.returnTo));
      setMfaChallengeCookie(res, result.challengeToken, result.mfa);
      return res;
    }
    const res = to(safeReturnPath(result.returnTo));
    setSessionCookies(res, result.tokens);
    if (host.kind === "company") rememberCompany(res, host.subdomain);
    return res;
  } catch (error) {
    return failed(error instanceof ApiError && error.code === ACCOUNT_IN_USE);
  }
};
