import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { dropCookie, providerProblem, providerService } from "@/api/modules/provider";
import { SSO_STATE_COOKIE } from "@/config/security/sessionCookieNames";

/**
 * The provider sends the browser back here, to the one address our applications are registered with. Java checks
 * `state` against `__Host-sso` and its own row, validates the answer and keeps it, and names where the browser goes:
 * the origin's `finish` with a handoff, or the origin's page with the failure. Nothing it says opens a session here.
 */
export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  try {
    const redirectUrl = await providerService.callback({
      code: params.get("code"),
      state: params.get("state"),
      error: params.get("error"),
      stateCookie: (await cookies()).get(SSO_STATE_COOKIE)?.value ?? null,
    });
    if (!redirectUrl) return providerProblem();
    const res = NextResponse.redirect(redirectUrl, 303);
    dropCookie(res, SSO_STATE_COOKIE);
    return res;
  } catch {
    return providerProblem();
  }
};
