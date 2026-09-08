import type { NextResponse } from "next/server";

import type { SessionTokens } from "@/api/modules/auth/services/hrisAuthSessionService";
import { REFRESH_COOKIE } from "@/api/modules/auth/services/hrisAuthSessionService";

/**
 * 14 days, matching the backend's refresh lifetime — a cookie that outlives its token is a lie.
 *
 * Was 30. Shortening it halves the window in which a stolen refresh token is worth anything, and
 * costs a person who has not opened the app in a fortnight one login. Rotation on use is deliberately
 * *not* here: it needs server-side session state to detect reuse, and `permHash` already invalidates
 * every token a user holds whenever their permissions — or their account state — change, which is
 * most of the benefit for none of the machinery.
 */
const REFRESH_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;

/**
 * The access token's own lifetime is 150 minutes; the cookie is given the refresh window instead.
 *
 * A cookie shorter than the session is what caused "Access denied" on a perfectly good session:
 * `access_token` and `has_session` had no `maxAge` at all, so they were *session* cookies — closing
 * the browser threw them away while a thirty-day refresh token sat there unused. `useAccess` then
 * read no marker, returned null **without asking the server**, and every gate on every page rendered
 * a refusal. Outliving the access token is correct and intended: the value inside it expiring is
 * what triggers renew-and-replay, and renewal is exactly what the refresh token is for.
 */
const SESSION_MAX_AGE_SECONDS = REFRESH_MAX_AGE_SECONDS;

/**
 * Writes the session onto the browser: the access token to send, the refresh token to renew it
 * with, and the non-httpOnly marker the app reads to know a session exists.
 *
 * Shared by login, refresh and impersonation so the three cookies cannot drift apart — the kind of
 * drift where a renewed session keeps an old marker and the client decides it has no rights.
 */
export const setSessionCookies = (res: NextResponse, tokens: SessionTokens): void => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set({
    name: "access_token",
    value: tokens.accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  // The backend rotates it on login and may rotate it on refresh; when it does not, the existing
  // cookie stands rather than being cleared.
  if (tokens.refreshToken) {
    res.cookies.set({
      name: REFRESH_COOKIE,
      value: tokens.refreshToken,
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: REFRESH_MAX_AGE_SECONDS,
    });
  }

  res.cookies.set({
    name: "has_session",
    value: "1",
    httpOnly: false,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};
