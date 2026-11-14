import { NextResponse, type NextRequest } from "next/server";
import { failedPage, isSharedProvider, keepCookie, providerService } from "@/api/modules/provider";
import publicConfig from "@/config/publicConfig";
import { PROVIDER_BACK_COOKIE, PROVIDER_ORIGIN_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost, safeReturnPath, requestOrigin } from "@/lib/companyAddress";

/**
 * "Continue with Google / Microsoft" for somebody not signed in (SIGN_IN_IMPLEMENTATION_DESIGN.md § 4.2): logging in
 * and accepting an invitation on a company's address, registering on the root. Java opens the round trip; this keeps
 * its binding in `__Host-provider-origin` on this host, and the page the button was on in `__Host-provider-back`, and
 * sends the browser to the auth host. A link, so a GET.
 */
export const GET = async (req: NextRequest) => {
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const origin = requestOrigin(req.headers, publicConfig.web);
  const params = req.nextUrl.searchParams;
  const provider = params.get("provider");
  const purpose = params.get("purpose");
  const invite = params.get("invite");
  const back =
    purpose === "SIGNUP" ? "/trial" : purpose === "INVITE" && invite ? `/invite?token=${encodeURIComponent(invite)}` : "/login";
  const failed = () => NextResponse.redirect(new URL(failedPage(back, provider, false), origin), 303);

  if (!isSharedProvider(provider) || (purpose !== "SIGN_IN" && purpose !== "INVITE" && purpose !== "SIGNUP")) return failed();
  // Registration lives on the root; logging in and invitations on a company's address.
  if ((purpose === "SIGNUP") !== (host.kind === "root")) return failed();
  try {
    const started = await providerService.start({
      purpose,
      provider,
      subdomain: host.kind === "company" ? host.subdomain : null,
      returnTo: purpose === "INVITE" ? "/welcome" : purpose === "SIGNUP" ? null : safeReturnPath(params.get("next")),
      inviteToken: purpose === "INVITE" ? invite : null,
    });
    const res = NextResponse.redirect(started.beginUrl, 303);
    keepCookie(res, PROVIDER_ORIGIN_COOKIE, started.originBinding);
    keepCookie(res, PROVIDER_BACK_COOKIE, back);
    return res;
  } catch {
    return failed();
  }
};
