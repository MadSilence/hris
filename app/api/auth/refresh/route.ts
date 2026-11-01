import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { UnauthorizedError } from "@/components/clients/exceptions";
import {
  hrisAuthSessionService,
  REFRESH_COOKIE,
} from "@/api/modules/auth/services/hrisAuthSessionService";
import { clearSessionCookies, setSessionCookies } from "@/api/modules/auth/services/sessionCookies";

/**
 * Trades the refresh token for a new pair. The backend rotates the refresh token on every call (R1.1),
 * so the new one is written back every time.
 *
 * Two refusals are not the end of the session:
 * - **`REFRESH_RACE`** — another tab of this browser renewed the same session a moment ago. The tabs
 *   share the cookie jar, so this browser already holds the new cookies; the answer tells the caller
 *   to retry its request rather than sign out.
 * - every other 401 is: the cookies are cleared, so the next page goes to sign-in instead of trying a
 *   token the server has already refused.
 */
export const POST = withErrorMiddleware(async () => {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    // No token to trade: not an error worth a stack trace, just a session that has to start again.
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const tokens = await hrisAuthSessionService.refresh(refreshToken);
    const res = NextResponse.json({ ok: true }, { status: 200 });
    setSessionCookies(res, tokens);
    return res;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      if (error.code === "REFRESH_RACE") {
        return NextResponse.json({ ok: true, raced: true }, { status: 200 });
      }
      const res = NextResponse.json({ ok: false }, { status: 401 });
      clearSessionCookies(res);
      return res;
    }
    throw error;
  }
});
