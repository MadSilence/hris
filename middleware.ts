import { NextResponse, type NextRequest } from "next/server";

import { parseHost, requestHost, routeForHost } from "@/lib/companyAddress";

/** The session's own cookies — `sessionCookies.ts`. `has_session` is not one: a script can remove it. */
const SESSION_COOKIES = ["access_token", "refresh_token"];

/**
 * Routes a request by the host it came to — the root, or a company's own address — and sends somebody
 * plainly signed out to the login before an app page renders. The table and the reasons are in
 * `lib/companyAddress/hostRouting.ts`; this only carries it out.
 *
 * **Routing, not a security check** (`hris/CLAUDE.md` § "Security model"). It looks at whether a session
 * cookie exists, never at what it holds.
 */
export function middleware(request: NextRequest) {
  const rootDomain = process.env.APP_ROOT_DOMAIN || "localhost:3000";
  const { pathname, search } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));
  const route = routeForHost(parseHost(requestHost(request.headers), rootDomain), pathname, search, hasSession);

  switch (route.type) {
    case "redirect":
      // Always a path on this same host, which is exactly what Next keeps a redirect as.
      return NextResponse.redirect(new URL(route.to, request.url));
    case "rewrite": {
      const url = request.nextUrl.clone();
      url.pathname = route.pathname;
      return NextResponse.rewrite(url);
    }
    default:
      return NextResponse.next();
  }
}

export const config = {
  // Everything but Next's own assets and files with an extension (icons, fonts, images).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
