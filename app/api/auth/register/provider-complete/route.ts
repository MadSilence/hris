import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import { SIGNUP_PROVIDER_COOKIE } from "@/config/security/sessionCookieNames";
import publicConfig from "@/config/publicConfig";
import { companyOrigin } from "@/lib/companyAddress";

/**
 * B3: the company from a Google or Microsoft draft. As with B2a the session belongs to the new company's own address,
 * so the answer is where to go: that address's handoff (SIGN_IN_IMPLEMENTATION_DESIGN.md § 6.2).
 */
export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const registered = await hrisAuthSessionService.registrationProviderComplete({
    draftToken: (await cookies()).get(SIGNUP_PROVIDER_COOKIE)?.value ?? "",
    firstName: String(payload?.firstName ?? ""),
    lastName: String(payload?.lastName ?? ""),
    companyName: String(payload?.companyName ?? ""),
  });
  const next = `${companyOrigin(registered.subdomain, publicConfig.web)}/api/auth/handoff?token=${encodeURIComponent(registered.handoffToken)}`;
  const res = NextResponse.json({ ok: true, next }, { status: 200 });
  res.cookies.set({ name: SIGNUP_PROVIDER_COOKIE, value: "", httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
});
