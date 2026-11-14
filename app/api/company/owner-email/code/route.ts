import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { ownerEmailService } from "@/api/modules/auth/services/ownerEmailService";
import { EMAIL_CODE_COOKIE } from "@/config/security/sessionCookieNames";

/** A code to the owner's own address, bound to this browser's `__Host-code` like every emailed code. */
export const POST = withErrorMiddleware(async () => {
  const store = await cookies();
  const browserToken = store.get(EMAIL_CODE_COOKIE)?.value ?? randomBytes(32).toString("base64url");
  await ownerEmailService.sendCode(browserToken);
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set({ name: EMAIL_CODE_COOKIE, value: browserToken, httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 10 * 60 });
  return res;
});
