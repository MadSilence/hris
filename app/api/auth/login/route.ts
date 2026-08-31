import { NextResponse } from "next/server";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { authRoutes } from "@/api/modules/auth/routes/authRoutes";
import { setSessionCookies } from "@/api/modules/auth/services/sessionCookies";

export const POST = withErrorMiddleware(async (req) => {
    const payload = await req.json();
    // Both tokens, not just the access one: the refresh token arrives as a `Set-Cookie` addressed to
    // this server, and dropping it here is what left the browser unable to renew anything.
    const tokens = await authRoutes.login(payload);

    const res = NextResponse.json({ ok: true }, { status: 200 });
    setSessionCookies(res, tokens);
    return res;
});
