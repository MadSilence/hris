import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import publicConfig from "@/config/publicConfig";
import { MFA_CHALLENGE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost } from "@/lib/companyAddress";

/**
 * The second step, described: which step it is and for how many days a device would be remembered (0 when that is not
 * offered). Read from the challenge in `__Host-mfa`, so the screen never offers what the server would ignore.
 */
export const GET = withErrorMiddleware(async (req) => {
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const subdomain = host.kind === "company" ? host.subdomain : "";
  const challengeToken = (await cookies()).get(MFA_CHALLENGE_COOKIE)?.value ?? "";
  const view = await hrisAuthSessionService.describeMfaChallenge(challengeToken, subdomain);
  return NextResponse.json(view, { status: 200 });
});
