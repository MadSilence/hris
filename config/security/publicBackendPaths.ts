export const normalizeBackendPath = (path: string): string => {
  const noHash = path.split("#")[0] || "";
  const noQuery = noHash.split("?")[0] || "";
  return noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
};

export const PUBLIC_BACKEND_EXACT_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/register/confirm",
  "/auth/refresh",
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
  // A phone uploading its owner's photo after scanning a QR code. The token is the credential, the
  // phone has no session, and a session belonging to whoever else is signed in on it must not travel.
  "/public/avatar/",
  // A company's login page, painted before sign-in. Whoever else is signed in on this browser has
  // nothing to do with it.
  "/public/company-appearance/",
  // "Don't know your company address?": asked by somebody who cannot sign in.
  "/auth/company-addresses/",
] as const;

export const isPublicBackendPath = (path: string): boolean => {
  const p = normalizeBackendPath(path);
  if ((PUBLIC_BACKEND_EXACT_PATHS as readonly string[]).includes(p)) return true;
  return (PUBLIC_BACKEND_PREFIX_PATHS as readonly string[]).some((prefix) => p.startsWith(prefix));
};
