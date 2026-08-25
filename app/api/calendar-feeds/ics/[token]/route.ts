import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";

type RouteContext = {
  params: Promise<{ token: string }>;
};

/**
 * Streams an ICS feed from the backend.
 *
 * Deliberately NOT wrapped in `apiRequestWrapper`: Outlook and Google Calendar fetch this URL with no
 * cookie and no Authorization header, so requiring a session would break the whole point. The token
 * in the path is the credential and the backend is what checks it.
 *
 * The proxy exists so the URL a person copies is on the app's own origin — the backend host is not
 * public configuration, and a link to it would not survive a deployment change.
 */
export async function GET(_req: Request, context: RouteContext) {
  const { token: segment } = await context.params;

  // The dynamic segment carries the extension too ("<token>.ics"), so strip it before validating —
  // otherwise the dot fails the check and every real feed 404s before it reaches the backend.
  const token = segment.replace(/\.ics$/i, "");

  // Any path segment is a token, so refuse anything that could climb out of the feed namespace.
  if (!/^[A-Za-z0-9_-]+$/.test(token)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const upstream = await hrisApiClient.fetch(`/calendar-feeds/ics/${token}.ics`, "text/calendar");
    const body = await upstream.text();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="calendar.ics"',
        "Cache-Control": "private, max-age=900",
      },
    });
  } catch {
    // A revoked or invented token must not confirm that anything was ever there.
    return new Response("Not found", { status: 404 });
  }
}
