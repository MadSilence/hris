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

/**
 * The browser a six-digit code was asked for in (SIGN_IN_IMPLEMENTATION_DESIGN.md § 2.1): a random value, only its
 * hash on the server. A code is accepted only together with it, so a code read on a phone is typed into the computer
 * that asked. Ten minutes, httpOnly, per host.
 */
export const EMAIL_CODE_COOKIE = "__Host-code";

/** A registration whose code was right (B2 → B2a): the draft token, half an hour, httpOnly, the root's. */
export const SIGNUP_DRAFT_COOKIE = "__Host-signup";

/**
 * A provider round trip's binding to the browser that started it (SIGN_IN_IMPLEMENTATION_DESIGN.md § 4.2): set on the
 * origin by `start`, checked on the same origin by `finish`. A handoff carried to another browser opens nothing.
 */
export const PROVIDER_ORIGIN_COOKIE = "__Host-provider-origin";

/**
 * The page a provider's button was on, kept beside the binding: a refusal goes back there saying which provider
 * failed. An invitation's page carries its token, so it is httpOnly like everything here.
 */
export const PROVIDER_BACK_COOKIE = "__Host-provider-back";

/** A registration through Google or Microsoft between the round trip and B3: the draft's token, ten minutes. */
export const SIGNUP_PROVIDER_COOKIE = "__Host-signup-provider";
