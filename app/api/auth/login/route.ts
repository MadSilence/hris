import { NextResponse } from "next/server";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { authRoutes } from "@/api/modules/auth/routes/authRoutes";
import { setSessionCookies } from "@/api/modules/auth/services/sessionCookies";
import { rememberCompany } from "@/api/modules/companyAddress";
import publicConfig from "@/config/publicConfig";
import { parseHost, requestHost } from "@/lib/companyAddress";

export const POST = withErrorMiddleware(async (req) => {
    const payload = await req.json();
    // The company is the host the form was opened at, never a field in the body: the browser's address
    // bar is what the person sees, and it is what they are signing in to.
    const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
    const subdomain = host.kind === "company" ? host.subdomain : "";

    // Both tokens, not just the access one: the refresh token arrives as a `Set-Cookie` addressed to
    // this server, and dropping it here is what left the browser unable to renew anything.
    const tokens = await authRoutes.login({
        email: payload?.email,
        password: payload?.password,
        subdomain,
    });

    const res = NextResponse.json({ ok: true }, { status: 200 });
    setSessionCookies(res, tokens);
    rememberCompany(res, subdomain);
    return res;
});
