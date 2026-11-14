import { NextResponse, type NextRequest } from "next/server";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { isSharedProvider, keepCookie, providerService } from "@/api/modules/provider";
import { PROVIDER_BACK_COOKIE, PROVIDER_ORIGIN_COOKIE } from "@/config/security/sessionCookieNames";
import { safeReturnPath } from "@/lib/companyAddress";

/**
 * Signed in: connect one's own Google or Microsoft account, or prove it is you again with it
 * (SIGN_IN_IMPLEMENTATION_DESIGN.md § 4.3, CONNECT and REAUTH). Java asks a Connect for a fresh proof first
 * (`AUTH00009`, answered by the step-up dialog); the page then navigates to `redirectUrl`.
 */
export const POST = withErrorMiddleware(async (req: NextRequest) => {
  const body = (await req.json()) as { purpose?: string; provider?: string; returnTo?: string };
  if ((body.purpose !== "CONNECT" && body.purpose !== "REAUTH") || !isSharedProvider(body.provider)) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }
  const returnTo = safeReturnPath(body.returnTo ?? "/preferences");
  const started = await providerService.startForPerson({ purpose: body.purpose, provider: body.provider, returnTo });
  const res = NextResponse.json({ redirectUrl: started.beginUrl });
  keepCookie(res, PROVIDER_ORIGIN_COOKIE, started.originBinding);
  keepCookie(res, PROVIDER_BACK_COOKIE, returnTo);
  return res;
});
