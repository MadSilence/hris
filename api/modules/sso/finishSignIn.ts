import { NextResponse } from "next/server";
import {
  setMfaChallengeCookie,
  setSessionCookies,
} from "@/api/modules/auth/services/sessionCookies";
import { rememberCompany } from "@/api/modules/companyAddress";
import { SSO_STATE_COOKIE } from "@/config/security/sessionCookieNames";
import { APP_HOME, safeReturnPath } from "@/lib/companyAddress";
import type { SsoOutcome } from "./ssoService";

/**
 * The second step's own route (sign-in-second-step): the code, or setting a factor up when the company requires one
 * the person has not got. `next` travels with it, already checked.
 */
export const secondStepPath = (mfa: "CHALLENGE" | "ENROL", returnTo: string | null): string => {
  const next = safeReturnPath(returnTo);
  const query = next && next !== APP_HOME ? `?next=${encodeURIComponent(next)}` : "";
  return `${mfa === "ENROL" ? "/login/set-up-two-step" : "/login/second-step"}${query}`;
};

/**
 * Turns the IdP's answer into a redirect on this company's host: a session's cookies and the page the person
 * was going to; the second step's challenge and the login page in that state; or, for Connect, back to
 * My Preferences. The SSO cookie goes in every case. 303, so a SAML POST becomes a GET.
 */
export const finishSignIn = (origin: string, subdomain: string, result: SsoOutcome, returnTo: string | null): NextResponse => {
  const to = (path: string) => NextResponse.redirect(new URL(path, origin), 303);
  let res: NextResponse;
  if (result.kind === "linked") {
    res = to("/preferences?sso=connected");
  } else if (result.kind === "mfa") {
    res = to(secondStepPath(result.mfa, returnTo));
    setMfaChallengeCookie(res, result.challengeToken, result.mfa);
  } else {
    res = to(safeReturnPath(returnTo) ?? APP_HOME);
    setSessionCookies(res, result.tokens);
    rememberCompany(res, subdomain);
  }
  res.cookies.set({ name: SSO_STATE_COOKIE, value: "", httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
};

/** Every refusal is one sentence on the login page; the reason is in the journal (§ 4.4). */
export const ssoFailed = (origin: string): NextResponse => {
  const res = NextResponse.redirect(new URL("/login?sso=failed", origin), 303);
  res.cookies.set({ name: SSO_STATE_COOKIE, value: "", httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
};
