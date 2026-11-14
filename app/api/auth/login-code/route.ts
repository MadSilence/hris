import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { hrisAuthSessionService } from "@/api/modules/auth/services/hrisAuthSessionService";
import publicConfig from "@/config/publicConfig";
import { EMAIL_CODE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost } from "@/lib/companyAddress";

/**
 * "Email me a login code" (sign-in-company-login C10): a code and a one-click link to the typed address, bound to this
 * browser's `__Host-code`. The company is the host, never the body. The answer is the same whatever exists.
 */
export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  const store = await cookies();
  const browserToken = store.get(EMAIL_CODE_COOKIE)?.value ?? randomBytes(32).toString("base64url");
  await hrisAuthSessionService.loginCodeSend(host.kind === "company" ? host.subdomain : "", String(payload?.email ?? ""), browserToken);
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set({ name: EMAIL_CODE_COOKIE, value: browserToken, httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 10 * 60 });
  return res;
});
