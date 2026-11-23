import { proxyUpload } from "@/lib/uploads";

type Context = { params: Promise<{ path: string[] }> };

/**
 * `/uploads/*` on every host — the root and every company's address — passed to the backend (R3, `lib/uploads`).
 * Bare on purpose (`hris/CLAUDE.md` § "Guard"): no session is needed, a login page shows its logo to nobody signed in,
 * and the backend alone decides which keys it releases.
 */
export async function GET(request: Request, { params }: Context) {
  const { path } = await params;
  return proxyUpload(request, path);
}
