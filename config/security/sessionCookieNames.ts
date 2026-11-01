/**
 * The session cookies' names, in one place the edge middleware can import without pulling in the
 * server's API client.
 *
 * All three carry the `__Host-` prefix (DECISIONS.md § "The decision session, sitting 3" → R1.1): the
 * browser accepts such a cookie only with `Secure`, `Path=/` and no `Domain`, so no other company's
 * subdomain can plant or read it. Browsers count `localhost` and `*.localhost` as secure, which is why
 * development over plain http keeps working.
 */
export const ACCESS_COOKIE = "__Host-access_token";

/** Must match the backend's `AuthController.REFRESH_COOKIE`: the BFF reads it out of the backend's Set-Cookie. */
export const REFRESH_COOKIE = "__Host-refresh_token";

/** Readable by the page: says a session exists, carries nothing. */
export const SESSION_MARKER_COOKIE = "__Host-has_session";

export const SESSION_COOKIES = [ACCESS_COOKIE, REFRESH_COOKIE] as const;

/**
 * The sign-in challenge between a correct password and an open session (MFA_DESIGN.md § 3.2). httpOnly
 * and `SameSite=Strict`: the page's script never holds it, and only this app sends it back.
 */
export const MFA_CHALLENGE_COOKIE = "__Host-mfa";

/**
 * A single sign-on in flight (R1.4): the hash of `state`, checked on the callback, so an answer from the
 * IdP is accepted only by the browser that asked. Ten minutes, `SameSite=Lax` — the callback is a top-level
 * navigation back from the IdP.
 */
export const SSO_STATE_COOKIE = "__Host-sso";

/** "Remember this device" (M1) — per host, so per company. Must match the backend's `MfaController`. */
export const TRUSTED_DEVICE_COOKIE = "__Host-td";
