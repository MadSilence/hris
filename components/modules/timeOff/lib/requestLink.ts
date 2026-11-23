import { APP_HOME } from "@/lib/companyAddress";

/**
 * A time off request is opened **over the page you were on** (AQ-12 b): there is no request page — any page with
 * `?leaveRequest={id}` shows the request in full (`LeaveRequestHost`, mounted once in the app shell).
 */
export const REQUEST_PARAM = "leaveRequest";

/**
 * Where a link to a request goes when there is no page it was on — a notification read out of the inbox, an email's
 * button through `/inbox/open/{id}`: Home with the request open over it (the owner's default, 2026-11-23). Home's own
 * path, not `/`: the company host's `/` redirects to Home and drops the query on the way.
 */
export const requestOnHome = (requestId: string): string =>
  `${APP_HOME}?${REQUEST_PARAM}=${encodeURIComponent(requestId)}`;

/** The request a link opens, when it is one (`…?leaveRequest=id`); null otherwise. */
export const requestIdOf = (href: string | null | undefined): string | null => {
  if (!href) return null;
  const query = href.indexOf("?");
  if (query < 0) return null;
  return new URLSearchParams(href.slice(query + 1)).get(REQUEST_PARAM);
};
