import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { finishSignIn, ssoFailed, ssoService } from "@/api/modules/sso";
import publicConfig from "@/config/publicConfig";
import { SSO_STATE_COOKIE, TRUSTED_DEVICE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost, requestOrigin } from "@/lib/companyAddress";

/**
 * The IdP sends the browser back here with `code` and `state` (and `iss`, RFC 9207). Java checks them
 * against the `__Host-sso` cookie and its own record; this sets what Java answered.
 */
export const GET = async (req: NextRequest) => {
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  // `request.url` is the URL before a middleware rewrite (hris/CLAUDE.md): build redirects from the host.
  const origin = requestOrigin(req.headers, publicConfig.web);
  if (host.kind !== "company") return ssoFailed(origin);
  const store = await cookies();
  const params = req.nextUrl.searchParams;
  try {
    const result = await ssoService.callback({
      subdomain: host.subdomain,
      code: params.get("code"),
      state: params.get("state"),
      iss: params.get("iss"),
      stateCookie: store.get(SSO_STATE_COOKIE)?.value ?? null,
      trustedDevice: store.get(TRUSTED_DEVICE_COOKIE)?.value ?? null,
    });
    return finishSignIn(origin, host.subdomain, result, null);
  } catch {
    return ssoFailed(origin);
  }
};
