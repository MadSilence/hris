import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import { EMAIL_CODE_COOKIE, SIGNUP_DRAFT_COOKIE } from "@/config/security/sessionCookieNames";

/** B2: the code, in the browser that asked. Right, it opens the details form for half an hour (B2a). */
export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const browserToken = (await cookies()).get(EMAIL_CODE_COOKIE)?.value ?? "";
  const draftToken = await hrisAuthSessionService.registrationVerify(
    String(payload?.email ?? ""), String(payload?.code ?? ""), browserToken);
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set({ name: SIGNUP_DRAFT_COOKIE, value: draftToken, httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 30 * 60 });
  return res;
});
