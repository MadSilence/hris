import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { hrisAuthSessionService, REFRESH_COOKIE } from "@/api/modules/auth/services/hrisAuthSessionService";
import { clearSessionCookies } from "@/api/modules/auth/services/sessionCookies";

/**
 * Ends the session — on the server first, then on this browser.
 *
 * The server half is new (R1.1): this route used to clear the cookies and never tell the backend, so a
 * copied refresh token outlived the sign-out by weeks. A backend that cannot be reached does not keep
 * the person signed in here: the cookies go regardless, and the session ends on its own clock.
 *
 * All three cookies, not just the access token: leaving the refresh token behind would let the next 401
 * quietly renew the session somebody had just ended, and leaving the marker behind tells the app there
 * is a session when there is not.
 */
export const POST = async () => {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      await hrisAuthSessionService.logout(refreshToken);
    } catch (error) {
      console.warn("Sign-out could not reach the backend; the cookies are cleared anyway.", error);
    }
  }
  const res = NextResponse.json({ ok: true });
  clearSessionCookies(res);
  return res;
};
