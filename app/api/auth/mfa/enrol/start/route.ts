import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import publicConfig from "@/config/publicConfig";
import { MFA_CHALLENGE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost } from "@/lib/companyAddress";

/** The company requires a factor the person has not got: the key to scan, inside the sign-in (§ 3.7). */
export const POST = withErrorMiddleware(async (req) => {
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const subdomain = host.kind === "company" ? host.subdomain : "";
  const challengeToken = (await cookies()).get(MFA_CHALLENGE_COOKIE)?.value ?? "";
  return NextResponse.json(await hrisAuthSessionService.enrolAtSignInStart(challengeToken, subdomain));
});
