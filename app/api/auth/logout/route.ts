import { NextResponse } from "next/server";

import { REFRESH_COOKIE } from "@/api/modules/auth/services/hrisAuthSessionService";

/**
 * Ends the session on this browser.
 *
 * All three cookies, not just the access token: leaving the refresh token behind would let the next
 * 401 quietly renew the session somebody had just ended, and leaving `has_session` behind tells the
 * app there is a session when there is not.
 */
export const POST = async () => {
    const res = NextResponse.json({ ok: true });
    res.cookies.set({ name: "access_token", value: "", path: "/", httpOnly: true, maxAge: 0 });
    res.cookies.set({ name: REFRESH_COOKIE, value: "", path: "/", httpOnly: true, maxAge: 0 });
    res.cookies.set({ name: "has_session", value: "", path: "/", httpOnly: false, maxAge: 0 });
    return res;
};
