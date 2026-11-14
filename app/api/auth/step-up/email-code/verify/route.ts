import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { hrisMfaService } from "@/api/modules/mfa/services";
import { EMAIL_CODE_COOKIE } from "@/config/security/sessionCookieNames";

/** The emailed step-up code, in the browser that asked: right, and the session has confirmed its person. */
export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const browserToken = (await cookies()).get(EMAIL_CODE_COOKIE)?.value ?? "";
  await hrisMfaService.stepUpEmailCodeVerify(String(payload?.code ?? ""), browserToken);
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set({ name: EMAIL_CODE_COOKIE, value: "", httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
});
