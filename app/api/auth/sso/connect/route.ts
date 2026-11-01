import { NextResponse } from "next/server";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { ssoService } from "@/api/modules/sso";
import { SSO_STATE_COOKIE } from "@/config/security/sessionCookieNames";

/**
 * Connect — the signed-in person links their own account to the IdP (R1.3: the only way a System Owner is
 * linked). Java asks for a fresh proof first (`AUTH00009`, answered by the step-up dialog); the page then
 * navigates to `redirectUrl`.
 */
export const POST = withErrorMiddleware(async () => {
  const started = await ssoService.connect("/preferences");
  const res = NextResponse.json({ redirectUrl: started.redirectUrl });
  res.cookies.set({ name: SSO_STATE_COOKIE, value: started.stateHash, httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 10 * 60 });
  return res;
});
