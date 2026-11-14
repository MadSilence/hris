import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { ownerEmailService } from "@/api/modules/auth/services/ownerEmailService";
import { EMAIL_CODE_COOKIE } from "@/config/security/sessionCookieNames";

/** The owner's code, in the browser that asked: right, and the company's mail is released. */
export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const browserToken = (await cookies()).get(EMAIL_CODE_COOKIE)?.value ?? "";
  await ownerEmailService.verify(String(payload?.code ?? ""), browserToken);
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set({ name: EMAIL_CODE_COOKIE, value: "", httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
});
