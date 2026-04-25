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
  "/auth/password/",
] as const;

export const isPublicBackendPath = (path: string): boolean => {
  const p = normalizeBackendPath(path);
  if ((PUBLIC_BACKEND_EXACT_PATHS as readonly string[]).includes(p)) return true;
  return (PUBLIC_BACKEND_PREFIX_PATHS as readonly string[]).some((prefix) => p.startsWith(prefix));
};
