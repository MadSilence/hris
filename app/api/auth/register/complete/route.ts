import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import { EMAIL_CODE_COOKIE, SIGNUP_DRAFT_COOKIE } from "@/config/security/sessionCookieNames";
import publicConfig from "@/config/publicConfig";
import { companyOrigin } from "@/lib/companyAddress";

/**
 * B2a: the company, its owner and a password. The session belongs to the new company's own address, which this host
 * cannot set cookies for, so the answer is where to go: that address's handoff, with a one-minute token
 * (SIGN_IN_IMPLEMENTATION_DESIGN.md § 6.2).
 */
export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const draftToken = (await cookies()).get(SIGNUP_DRAFT_COOKIE)?.value ?? "";
  const registered = await hrisAuthSessionService.registrationComplete({
    draftToken,
    firstName: String(payload?.firstName ?? ""),
    lastName: String(payload?.lastName ?? ""),
    companyName: String(payload?.companyName ?? ""),
    password: String(payload?.password ?? ""),
  });
  const next = `${companyOrigin(registered.subdomain, publicConfig.web)}/api/auth/handoff?token=${encodeURIComponent(registered.handoffToken)}`;
  const res = NextResponse.json({ ok: true, next }, { status: 200 });
  for (const name of [SIGNUP_DRAFT_COOKIE, EMAIL_CODE_COOKIE]) {
    res.cookies.set({ name, value: "", httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 0 });
  }
  return res;
});
