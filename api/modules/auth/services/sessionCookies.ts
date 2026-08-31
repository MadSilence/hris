import type { NextResponse } from "next/server";

import type { SessionTokens } from "@/api/modules/auth/services/hrisAuthSessionService";
import { REFRESH_COOKIE } from "@/api/modules/auth/services/hrisAuthSessionService";

/** 30 days, matching the backend's refresh lifetime — a cookie that outlives its token is a lie. */
const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/**
 * Writes the session onto the browser: the access token to send, the refresh token to renew it
 * with, and the non-httpOnly marker the app reads to know a session exists.
 *
 * Shared by login and refresh so the three cookies cannot drift apart — the kind of drift where a
 * renewed session keeps an old marker and the client decides it has no rights.
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
  });
};
