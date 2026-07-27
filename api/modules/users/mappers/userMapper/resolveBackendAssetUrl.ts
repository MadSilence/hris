const HRIS_API_BASE_URL = process.env.BACKEND_URL;

// Turns a backend asset path into an absolute URL. Idempotent: an already-absolute
// URL is returned unchanged, so it is safe to run over responses the backend has
// already resolved.
export function resolveBackendAssetUrl(path?: string | null): string | null {
  if (!path) return null;

  if (path.includes("/uploads/http")) {
    const idx = path.indexOf("/uploads/");
    const inner = path.substring(idx + "/uploads/".length);

    if (inner.startsWith("http")) {
      return inner;
    }
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${HRIS_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
