import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import {
  hrisAuthSessionService,
  REFRESH_COOKIE,
} from "@/api/modules/auth/services/hrisAuthSessionService";
import { setSessionCookies } from "@/api/modules/auth/services/sessionCookies";

/**
 * Trades the refresh token for a new access token.
 *
 * Access tokens last 150 minutes and refresh tokens 30 days, so a working day used to end in a
 * login screen with 29 days of validity unused — the endpoint existed on the backend and nothing
 * could reach it, because the refresh cookie never made it past this server. A bare cookie flow, so
 * it is a route handler rather than an action.
 */
export const POST = withErrorMiddleware(async () => {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    // No token to trade: not an error worth a stack trace, just a session that has to start again.
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const tokens = await hrisAuthSessionService.refresh(refreshToken);

  const res = NextResponse.json({ ok: true }, { status: 200 });
  setSessionCookies(res, tokens);
  return res;
});
