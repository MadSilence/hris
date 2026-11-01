import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { authRoutes } from "@/api/modules/auth/routes/authRoutes";
import { setMfaChallengeCookie, setSessionCookies } from "@/api/modules/auth/services/sessionCookies";
import { rememberCompany } from "@/api/modules/companyAddress";
import publicConfig from "@/config/publicConfig";
import { TRUSTED_DEVICE_COOKIE } from "@/config/security/sessionCookieNames";
import { parseHost, requestHost } from "@/lib/companyAddress";

/**
 * Signs in with a password. Two answers (MFA_DESIGN.md § 3.2): a session — its cookies set here — or a
 * second step, `{ next: "mfa" }`, with the challenge kept in an httpOnly cookie the page never reads.
 */
export const POST = withErrorMiddleware(async (req) => {
    const payload = await req.json();
    // The company is the host the form was opened at, never a field in the body: the browser's address
    // bar is what the person sees, and it is what they are signing in to.
    const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
    const subdomain = host.kind === "company" ? host.subdomain : "";
    const trustedDevice = (await cookies()).get(TRUSTED_DEVICE_COOKIE)?.value;

    const result = await authRoutes.login({
        email: payload?.email,
        password: payload?.password,
        subdomain,
    }, trustedDevice);

    if (result.kind === "mfa") {
        const res = NextResponse.json({ ok: true, next: "mfa", mfa: result.mfa }, { status: 200 });
        setMfaChallengeCookie(res, result.challengeToken, result.mfa);
        return res;
    }

    // Both tokens, not just the access one: the refresh token arrives as a `Set-Cookie` addressed to
    // this server, and dropping it here is what left the browser unable to renew anything.
    const res = NextResponse.json({ ok: true }, { status: 200 });
    setSessionCookies(res, result.tokens);
    rememberCompany(res, subdomain);
    return res;
});
