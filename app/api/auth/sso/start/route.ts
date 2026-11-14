import { NextResponse, type NextRequest } from "next/server";
import { ssoFailed, ssoService } from "@/api/modules/sso";
import publicConfig from "@/config/publicConfig";
import { SSO_STATE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost, safeReturnPath, requestOrigin } from "@/lib/companyAddress";

/**
 * "Sign in with <provider>": Java builds the request to the IdP; this keeps the hash of `state` in
 * `__Host-sso` (R1.4) and sends the browser there. A link, so a GET.
 */
export const GET = async (req: NextRequest) => {
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const origin = requestOrigin(req.headers, publicConfig.web);
  if (host.kind !== "company") return ssoFailed(origin);
  const returnTo = safeReturnPath(req.nextUrl.searchParams.get("next")) ?? null;
  try {
    const started = await ssoService.start(host.subdomain, returnTo ?? "");
    const res = NextResponse.redirect(started.redirectUrl, 302);
    res.cookies.set({
      name: SSO_STATE_COOKIE,
      value: started.stateHash,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
    });
    return res;
  } catch {
    return ssoFailed(origin);
  }
};
