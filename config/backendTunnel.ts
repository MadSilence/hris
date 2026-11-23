/**
 * TEMPORARY — remove when the backend moves to a server.
 *
 * While the backend is reached through a free ngrok tunnel, ngrok answers any request that carries a
 * browser's User-Agent with an HTML warning page instead of passing it on. Every call to Java carries
 * the browser's User-Agent on purpose (`callerHeaders` in `hrisApiClient`, for the journal and the
 * session list), so through the tunnel every signed-in read got HTML and failed to parse. This header
 * tells ngrok to skip the page.
 *
 * It is sent only when `BACKEND_URL` is an ngrok address, so it does nothing anywhere else — but it
 * is a workaround for one hosting setup, not part of the product. Removing it: delete this file and
 * its five callers (`hrisApiClient.prepareHeaders`, `jwksClient`, `app/api/me/access/route.ts`,
 * `app/api/documents/users/[userId]/upload/route.ts`, `lib/uploads/uploadProxy.ts`). Tracked in
 * `(claude)/technical_design/PRODUCTION_READINESS_DESIGN.md`.
 *
 * Uploaded avatars and logos are covered too since R3 (2026-11-23): the browser asks the company's own address for
 * `/uploads/…` and `lib/uploads` passes it on to the backend with this header.
 */
const NGROK_HOST = /\.ngrok(-free)?\.(app|dev|io)$/i;

const isNgrok = (backendUrl: string | undefined): boolean => {
  if (!backendUrl) return false;
  try {
    return NGROK_HOST.test(new URL(backendUrl).hostname);
  } catch {
    return false;
  }
};

export const backendTunnelHeaders = (
  backendUrl: string | undefined = process.env.BACKEND_URL,
): Record<string, string> => (isNgrok(backendUrl) ? { "ngrok-skip-browser-warning": "1" } : {});
