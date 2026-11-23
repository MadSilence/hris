import { backendTunnelHeaders } from "@/config/backendTunnel";

/**
 * Uploaded files — a logo, a photo, the login page's picture — on the company's own address (the owner's R3,
 * 2026-11-23). The backend serves them under `/uploads/<key>` (`PublicAssetController`: only a key still referenced
 * as a logo, an avatar or a login image, with its own `Cache-Control` and `Content-Security-Policy: sandbox`); every
 * host of this app passes `/uploads/*` to it, so the app writes the path relative and the page's image policy is
 * `'self'`.
 *
 * A route handler rather than a rewrite in `next.config.ts`: a rewrite's destination is fixed when the app is built,
 * and `BACKEND_URL` is read when it runs.
 */

/** The backend's answer headers a browser needs to show and cache the file — nothing else travels. */
const PASSED_RESPONSE_HEADERS = [
  "content-type",
  "content-length",
  "cache-control",
  "etag",
  "last-modified",
  "content-disposition",
  "content-security-policy",
  "x-content-type-options",
];

/** The browser's revalidation headers, so a cached file is answered 304. */
const PASSED_REQUEST_HEADERS = ["if-none-match", "if-modified-since"];

/** `["company", "logo", "a b.png"]` → `/uploads/company/logo/a%20b.png`; each segment encoded on its own. */
export const uploadPath = (segments: string[]): string =>
  `/uploads/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;

interface HeaderSource {
  get(name: string): string | null;
}

/** Where the backend is asked, and with which headers — null when there is nothing to ask for. */
export const upstreamRequest = (
  browserHeaders: HeaderSource,
  segments: string[],
  backendUrl: string | undefined,
): { url: string; headers: Record<string, string> } | null => {
  if (!backendUrl || segments.length === 0) return null;
  const headers: Record<string, string> = { ...backendTunnelHeaders(backendUrl) };
  for (const name of PASSED_REQUEST_HEADERS) {
    const value = browserHeaders.get(name);
    if (value) headers[name] = value;
  }
  const base = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
  return { url: `${base}${uploadPath(segments)}`, headers };
};

/** The backend's headers the browser gets — the file's type, size and caching; never a cookie. */
export const passedResponseHeaders = (backendHeaders: HeaderSource): Record<string, string> => {
  const headers: Record<string, string> = {};
  for (const name of PASSED_RESPONSE_HEADERS) {
    const value = backendHeaders.get(name);
    if (value) headers[name] = value;
  }
  return headers;
};

export const proxyUpload = async (request: Request, segments: string[]): Promise<Response> => {
  const upstream = upstreamRequest(request.headers, segments, process.env.BACKEND_URL);
  if (!upstream) return new Response(null, { status: 404 });

  let answer: Response;
  try {
    answer = await fetch(upstream.url, { headers: upstream.headers, cache: "no-store" });
  } catch {
    return new Response(null, { status: 502 });
  }
  return new Response(answer.status === 304 ? null : answer.body, {
    status: answer.status,
    headers: passedResponseHeaders(answer.headers),
  });
};
