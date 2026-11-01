import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { finishSignIn, ssoFailed, ssoService } from "@/api/modules/sso";
import publicConfig from "@/config/publicConfig";
import { TRUSTED_DEVICE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost } from "@/lib/companyAddress";

/**
 * The SAML Assertion Consumer Service: the IdP's cross-site POST (R1.5). Bound to us by `InResponseTo`
 * against Java's own record of the request, not by a cookie — a Lax cookie does not ride a cross-site POST.
 */
export const POST = async (req: NextRequest) => {
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const origin = new URL(req.url).origin;
  if (host.kind !== "company") return ssoFailed(origin);
  try {
    const form = await req.formData();
    const samlResponse = form.get("SAMLResponse");
    if (typeof samlResponse !== "string") return ssoFailed(origin);
    const result = await ssoService.samlAcs({
      subdomain: host.subdomain,
      samlResponse,
      trustedDevice: (await cookies()).get(TRUSTED_DEVICE_COOKIE)?.value ?? null,
    });
    return finishSignIn(origin, host.subdomain, result, null);
  } catch {
    return ssoFailed(origin);
  }
};
