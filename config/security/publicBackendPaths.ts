export const normalizeBackendPath = (path: string): string => {
  const noHash = path.split("#")[0] || "";
  const noQuery = noHash.split("?")[0] || "";
  return noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
};

export const PUBLIC_BACKEND_EXACT_PATHS = [
  "/auth/login",
  "/auth/refresh",
  // Registration by code, and the handoff that opens the new company's session (SIGN_IN_IMPLEMENTATION_DESIGN.md
  // § 6.1–6.2): nobody is signed in to it yet, and a session of whoever else uses this browser must not ride along.
  "/auth/handoff",
  // Logging in with an emailed code (§ 6.4) and what the second step's screen reads before anything is typed.
  "/auth/login-code",
  "/auth/mfa/challenge",
  // Which of Google and Microsoft registration offers.
  "/public/shared-providers",
  // Sign-out revokes by the refresh cookie (R1.1). A Bearer that has run out would be refused by the
  // filter before the endpoint could end the session it belongs to.
  "/auth/logout",
  // The second step of a sign-in: there is no session yet, and somebody else's must not travel with it.
  "/auth/mfa/verify",
] as const;

export const PUBLIC_BACKEND_PREFIX_PATHS = [
  // Forgot password and the reset link: the person cannot sign in, and the token is the credential.
  // The signed-in change (`/me/password`) is deliberately not here — it needs the session.
  "/auth/password/",
  // ICS subscription feeds: a calendar client fetches a bare URL with no session, so the token in
  // the path is the credential and no Bearer must be attached.
  "/calendar-feeds/ics/",
  // Accepting an invitation: the person has no session yet, and one belonging to whoever else is
  // signed in on this browser must not travel with it.
  "/auth/invite/",
  // The preboarding page: somebody with no account, holding a link. Same reason.
  "/public/preboarding/",
  // A published report snapshot: whoever holds the link, signed in or not. The token is the credential,
  // and a session belonging to whoever is signed in on this browser has nothing to do with it.
  "/public/reports/",
  // An unsubscribe link from an email (EMAIL_NOTIFICATIONS_DESIGN.md § 9.2): opened from a mailbox, the
  // signed token is the credential, and a session from this browser has nothing to do with it.
  "/public/email/",
  // A phone uploading its owner's photo after scanning a QR code. The token is the credential, the
  // phone has no session, and a session belonging to whoever else is signed in on it must not travel.
  "/public/avatar/",
  // A company's login page, painted before sign-in. Whoever else is signed in on this browser has
  // nothing to do with it.
  "/public/company-appearance/",
  // "Don't know your company address?": asked by somebody who cannot sign in.
  "/auth/company-addresses/",
  // Setting up a required factor inside a sign-in — the challenge is the credential.
  "/auth/mfa/enrol-at-sign-in/",
  "/auth/mfa/enrol-at-sign-in/",
  "/auth/register/",
  "/auth/login-code/",
  // Google and Microsoft before there is a session (§ 4.2). `/auth/provider/person/` and `/finish` are not here:
  // a Connect or a re-authentication needs the session that started it.
  "/auth/provider/start",
  "/auth/provider/begin",
  "/auth/provider/callback",
  // Single sign-on before there is a session: the IdP's answer is the credential.
  "/auth/sso/start",
  "/auth/sso/callback",
  "/auth/saml/",
  "/public/company-sso/",
  "/public/saml-metadata/",
  // SCIM carries the IdP's own bearer token; a session from this browser must never ride along.
  "/scim/v2/",
] as const;

export const isPublicBackendPath = (path: string): boolean => {
  const p = normalizeBackendPath(path);
  if ((PUBLIC_BACKEND_EXACT_PATHS as readonly string[]).includes(p)) return true;
  return (PUBLIC_BACKEND_PREFIX_PATHS as readonly string[]).some((prefix) => p.startsWith(prefix));
};
