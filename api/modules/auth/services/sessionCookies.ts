import type { NextResponse } from "next/server";

import type { SessionTokens } from "@/api/modules/auth/services/hrisAuthSessionService";
import {
  ACCESS_COOKIE,
  MFA_CHALLENGE_COOKIE,
  REFRESH_COOKIE,
  SESSION_MARKER_COOKIE,
  TRUSTED_DEVICE_COOKIE,
} from "@/config/security/sessionCookieNames";

/**
 * 30 days, the backend's absolute session lifetime (`app.sessions.absolute-days`) — a cookie that
 * outlives its session is a lie. The session itself lives on the server now (R1.1): it ends on sign-out,
 * on a block or a password change, or after two weeks unused, whatever the cookie says.
 */
const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/**
 * The access token's own lifetime is 30 minutes; the cookie is given the session's instead.
 *
 * A cookie shorter than the session is what caused "Access denied" on a perfectly good session: the
 * access cookie and the marker had no `maxAge` at all, so they were *session* cookies — closing the
 * browser threw them away while a long-lived refresh token sat there unused. `useAccess` then read no
 * marker, returned null **without asking the server**, and every gate on every page rendered a
 * refusal. Outliving the access token is correct and intended: the value inside it expiring is what
 * triggers renew-and-replay, and renewal is exactly what the refresh token is for.
 */
const SESSION_MAX_AGE_SECONDS = REFRESH_MAX_AGE_SECONDS;

/**
 * Writes the session onto the browser: the access token to send, the refresh token to renew it with,
 * and the readable marker the app checks to know a session exists.
 *
 * Shared by login, refresh and impersonation so the three cookies cannot drift apart — the kind of
 * drift where a renewed session keeps an old marker and the client decides it has no rights.
 *
 * **`Secure` always**, which the `__Host-` prefix demands anyway (R1.1) — it used to follow
 * `NODE_ENV`, so a production build served over http would have sent the session in the clear. The
 * refresh token is `SameSite=Strict`: only the app itself ever sends it. The access cookie stays `Lax`,
 * because a link from a mail is a cross-site navigation and must land signed in.
 */
export const setSessionCookies = (res: NextResponse, tokens: SessionTokens): void => {
  res.cookies.set({
    name: ACCESS_COOKIE,
    value: tokens.accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  // The backend rotates it on every login and refresh; a response without one leaves the cookie standing.
  if (tokens.refreshToken) {
    res.cookies.set({
      name: REFRESH_COOKIE,
      value: tokens.refreshToken,
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      path: "/",
      maxAge: REFRESH_MAX_AGE_SECONDS,
    });
  }

  res.cookies.set({
    name: SESSION_MARKER_COOKIE,
    value: "1",
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

/**
 * The sign-in challenge (MFA_DESIGN.md § 3.2): five minutes to answer the code, fifteen to set one up.
 * The cookie outlives neither.
 */
export const setMfaChallengeCookie = (res: NextResponse, token: string, purpose: "CHALLENGE" | "ENROL"): void => {
  res.cookies.set({
    name: MFA_CHALLENGE_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    path: "/",
    maxAge: purpose === "CHALLENGE" ? 5 * 60 : 15 * 60,
  });
};

export const clearMfaChallengeCookie = (res: NextResponse): void => {
  res.cookies.set({ name: MFA_CHALLENGE_COOKIE, value: "", httpOnly: true, sameSite: "strict", secure: true, path: "/", maxAge: 0 });
};

/** "Remember this device" (M1): its own cookie, for at most the 30 days a company may choose. */
export const setTrustedDeviceCookie = (res: NextResponse, token: string): void => {
  res.cookies.set({
    name: TRUSTED_DEVICE_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
};

/** Removes all three, with the same attributes they were set with — a `__Host-` cookie is not cleared otherwise. */
export const clearSessionCookies = (res: NextResponse): void => {
  for (const [name, httpOnly, sameSite] of [
    [ACCESS_COOKIE, true, "lax"],
    [REFRESH_COOKIE, true, "strict"],
    [SESSION_MARKER_COOKIE, false, "lax"],
  ] as const) {
    res.cookies.set({ name, value: "", httpOnly, sameSite, secure: true, path: "/", maxAge: 0 });
  }
};
