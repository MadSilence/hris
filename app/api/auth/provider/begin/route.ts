import { NextResponse, type NextRequest } from "next/server";
import { keepCookie, providerProblem, providerService } from "@/api/modules/provider";
import { SSO_STATE_COOKIE } from "@/config/security/sessionCookieNames";

/**
 * On the auth host: the ticket from `start` is spent, the state's hash kept in this host's `__Host-sso`, and the
 * browser sent to the provider's account chooser.
 */
export const GET = async (req: NextRequest) => {
  try {
    const begun = await providerService.begin(req.nextUrl.searchParams.get("r") ?? "");
    const res = NextResponse.redirect(begun.authorizeUrl, 303);
    keepCookie(res, SSO_STATE_COOKIE, begun.stateHash);
    return res;
  } catch {
    return providerProblem();
  }
};
