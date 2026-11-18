/**
 * The page's Content Security Policy (PRODUCTION_READINESS_DESIGN.md S5). `middleware.ts` makes a fresh nonce for
 * every request and sends this policy on the request — where Next reads it and puts the nonce on every script it
 * renders — and on the response, where the browser enforces it.
 *
 * **Scripts are the point.** Only a script carrying this request's nonce runs, and with `'strict-dynamic'` the
 * chunks it loads run too; an injected `<script>` or an `onclick=` attribute does not. The app writes no inline
 * script of its own (no `dangerouslySetInnerHTML`, no `next/script`), so nothing else needs the nonce.
 *
 * **Styles allow `'unsafe-inline'`** on purpose: the workspace accent is a `style` attribute on `<html>`
 * (`lib/theme/accent.ts`), and the canvases, the calendar and the motion library set `style` on elements. A nonce
 * cannot cover an attribute; hashes cannot cover values computed at run time. A style cannot run code, so this
 * costs little next to the script rule.
 *
 * **`form-action` is left out.** Signing in with Google or Microsoft goes through a form whose answer is a redirect
 * to the provider, and Chrome checks that redirect against `form-action` — `'self'` would break the buttons.
 */
export type CspMode = "production" | "development";

export const contentSecurityPolicy = (nonce: string, mode: CspMode): string => {
  const development = mode === "development";
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // React's development build evaluates code for its error overlay and fast refresh; production never does.
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(development ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    // Avatars, logos and the example people's portraits (`public/sample-avatars/`) come from the app itself; a company
    // may later serve files from a storage host — so any https image, never a script.
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    // The browser talks only to its own host (`/api/…` — hris/CLAUDE.md); development adds the reload socket.
    // `blob:` is the page reading back bytes it already holds: `PdfViewer` fetches the blob URL its caller made from
    // the downloaded file. Only a script on this page can mint one, so it reaches no other host. Without it every
    // PDF on the signing screen and in a document preview read "We couldn't show this document" (walk of 2026-11-18).
    "connect-src": ["'self'", "blob:", ...(development ? ["ws:", "wss:"] : [])],
    // A document preview opens the downloaded file as a blob in an iframe (PreviewDocumentModal).
    "frame-src": ["'self'", "blob:"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
};

/** 128 random bits, base64 — what CSP asks of a nonce. Runs in the Edge runtime, so Web Crypto and `btoa` only. */
export const createNonce = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
};

/** The request header the root layout reads the nonce from, should a component ever need it. */
export const NONCE_HEADER = "x-nonce";
