/**
 * Turns the path the backend gives an uploaded file into the one a page writes. Since the owner's R3 (2026-11-23)
 * every host of this app serves `/uploads/*` itself (`app/uploads`, `lib/uploads`), so an upload stays **relative** —
 * `/uploads/<key>` on whichever company's address the page is on — and the image policy can be `'self'`.
 *
 * Idempotent: an absolute URL is returned unchanged, and a site-relative path is the app's own (an upload, or a
 * sample person's portrait in `public/sample-avatars/`). The name is kept: a dozen mappers call it.
 */
export function resolveBackendAssetUrl(path?: string | null): string | null {
  if (!path) return null;

  // An old shape: an absolute URL stored as if it were a key, `/uploads/https://…`.
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

  return path.startsWith("/") ? path : `/${path}`;
}
