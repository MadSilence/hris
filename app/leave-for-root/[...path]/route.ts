import publicConfig from "@/config/publicConfig";
import { LEAVE_FOR_ROOT_ROUTE, rootDestination } from "@/lib/companyAddress";

type Context = { params: Promise<{ path: string[] }> };

/**
 * A root page asked for on a company's address — `/pricing`, `/trial/confirm?token=…` — sent to the root.
 * `middleware.ts` rewrites those requests to `/leave-for-root/<the path>`; see `LEAVE_FOR_ROOT_ROUTE` for
 * why this is a route handler rather than a redirect in the middleware.
 *
 * The path comes from the route's own segments: `request.url` here is still the URL the browser asked for,
 * before the rewrite. Its query is the one that travels on.
 */
export async function GET(request: Request, { params }: Context) {
  const { path } = await params;
  const { search } = new URL(request.url);
  return Response.redirect(
    rootDestination(`${LEAVE_FOR_ROOT_ROUTE}/${path.join("/")}`, search, publicConfig.web),
    307,
  );
}
