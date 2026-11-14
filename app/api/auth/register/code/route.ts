import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import { EMAIL_CODE_COOKIE } from "@/config/security/sessionCookieNames";

/**
 * B1 and B2's *resend*: a six-digit code to the address (sign-in-registration). The browser gets a `__Host-code`
 * value the first time; the code is bound to it, so it works only here. The answer is the same whatever the address.
 */
export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const store = await cookies();
  const browserToken = store.get(EMAIL_CODE_COOKIE)?.value ?? randomBytes(32).toString("base64url");
  await hrisAuthSessionService.registrationCode(String(payload?.email ?? ""), browserToken);
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set({ name: EMAIL_CODE_COOKIE, value: browserToken, httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 10 * 60 });
  return res;
});
