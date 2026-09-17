import { type HostKind, rootOrigin, type WebAddressConfig } from "./companyAddress";

/**
 * Which page a host shows for a path. Pure, so the whole table is testable without a Next runtime;
 * `middleware.ts` only carries it out.
 *
 * **Routing, not a security check.** It decides what a host shows, never who may see it
 * (`hris/CLAUDE.md` § "Security model").
 *
 * - **The root** holds the landing pages, "sign in to your company" at `/login`, and the trial. A company
 *   page asked for on the root has no company to belong to, so it goes to `/login`.
 * - **A company's address** holds its login, its token pages and the app. The landing pages belong to the
 *   root and go there; `/` is the app.
 */
export type HostRoute =
  | { type: "next" }
  | { type: "redirect"; to: string }
  | { type: "rewrite"; pathname: string };

/** Pages that exist only on the root. Matched as a path or a path prefix. */
export const ROOT_ONLY_PATHS = ["/about", "/pricing", "/products", "/solutions", "/trial", "/find-company"];

/** Reachable on either host: the BFF, and the refusal page. */
const EITHER_PATHS = ["/api", "/403"];

/** The company login's own route, so it can own the whole screen. Its only address is `/login`. */
export const COMPANY_LOGIN_ROUTE = "/company-login";

/**
 * Sends a company host's request for a root page to the root, from a route handler.
 *
 * **Not a middleware redirect, and that is the whole reason it exists.** Next's router rewrites a
 * middleware `Location` into a relative one whenever its origin matches the server's own — and locally
 * the root *is* the server's own origin, `localhost:3000`. `acme.localhost:3000/pricing` was answered
 * `Location: /pricing`, on the same company host, forever (seen live 2026-09-15). A route handler's
 * response is sent as written.
 */
export const LEAVE_FOR_ROOT_ROUTE = "/leave-for-root";

/**
 * A company's pages for somebody who has no session yet: the login, and the pages a link from an email
 * opens — the token in them is the credential.
 */
// `/m` is the mobile hand-off: a page reached by scanning a QR code on a screen somebody is already
// signed in on, carrying a one-time token. Short because it is typed into nothing and scanned from a
// phone camera, where every character is a pixel of the code.
const COMPANY_PUBLIC_PATHS = ["/invite", "/preboarding", "/reset-password", "/forgot-password", "/m"];

/** Where the app opens, and where signing in goes when nothing asked for somewhere else. */
export const APP_HOME = "/dashboard";

const matches = (pathname: string, paths: string[]): boolean =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

/**
 * `to` of a redirect is always a path on the same host; leaving for the root goes through a rewrite.
 *
 * `hasSession` is whether the browser holds a session cookie at all — **presence, not validity**. It
 * stops an app page rendering its shell for somebody who is plainly signed out, and nothing more: whether
 * a token is still good, and what it may do, stays the backend's answer, and a refused one still ends on
 * the login through the API client's 401 path.
 */
export const routeForHost = (host: HostKind, pathname: string, search: string, hasSession: boolean): HostRoute => {
  if (matches(pathname, EITHER_PATHS)) return { type: "next" };

  if (host.kind === "root") {
    if (pathname === "/" || pathname === "/login" || matches(pathname, ROOT_ONLY_PATHS)) return { type: "next" };
    return { type: "redirect", to: "/login" };
  }

  if (pathname === "/") return { type: "redirect", to: hasSession ? APP_HOME : "/login" };
  // The destination travels in the path: Next keeps a request's own query across a rewrite and drops one
  // the rewrite tries to set.
  if (matches(pathname, ROOT_ONLY_PATHS)) return { type: "rewrite", pathname: `${LEAVE_FOR_ROOT_ROUTE}${pathname}` };
  if (pathname === "/login") return { type: "rewrite", pathname: COMPANY_LOGIN_ROUTE };
  if (pathname === COMPANY_LOGIN_ROUTE) return { type: "redirect", to: `/login${search}` };
  if (matches(pathname, COMPANY_PUBLIC_PATHS)) return { type: "next" };

  if (!hasSession) {
    return { type: "redirect", to: `/login?${new URLSearchParams({ next: `${pathname}${search}` }).toString()}` };
  }

  return { type: "next" };
};

/**
 * Where signing in goes: the page that sent the person to log in, when it is a page of this app on this
 * host, and the app's home otherwise.
 *
 * Only a plain path is followed. `//evil.example`, `/\evil.example`, a full URL, or anything that would
 * lead back to the login or out of the app is not — a `next` that could name another host would turn the
 * login into a way to send somebody anywhere with the company's own address in front of it.
 */
export const safeReturnPath = (next: string | null | undefined): string => {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return APP_HOME;
  if ([...next].some((character) => character.charCodeAt(0) < 0x20)) return APP_HOME;

  const pathname = next.split(/[?#]/)[0] ?? "";
  if (
    pathname === "/" ||
    matches(pathname, ["/login", COMPANY_LOGIN_ROUTE, LEAVE_FOR_ROOT_ROUTE, ...EITHER_PATHS, ...ROOT_ONLY_PATHS]) ||
    matches(pathname, COMPANY_PUBLIC_PATHS)
  ) {
    return APP_HOME;
  }
  return next;
};

/**
 * Where on the root a `LEAVE_FOR_ROOT_ROUTE` request goes: the path after the prefix, with the query it
 * came with. Only root pages are ever sent on; anything else — `//evil.example`, a company page — lands on
 * the root's front page, so this cannot become a way to send somebody to another host.
 */
export const rootDestination = (rewrittenPathname: string, search: string, web: WebAddressConfig): string => {
  const path = rewrittenPathname.startsWith(`${LEAVE_FOR_ROOT_ROUTE}/`)
    ? rewrittenPathname.slice(LEAVE_FOR_ROOT_ROUTE.length)
    : "/";
  const safe = matches(path, ROOT_ONLY_PATHS) ? `${path}${search}` : "/";
  return `${rootOrigin(web)}${safe}`;
};
