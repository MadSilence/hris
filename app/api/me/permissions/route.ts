import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("access_token")?.value ?? "";
    const headerAuth = req.headers.get("authorization") || "";
    const ifNoneMatch = req.headers.get("if-none-match");

    const isDev = process.env.NODE_ENV !== "production";
    const rawBase = process.env.BACKEND_URL ?? null;
    if (!rawBase) {
      return Response.json({ error: "BACKEND_URL is not set" }, { status: 500 });
    }
    const backendBase = rawBase.replace(/\/+$/, "");
    const validBase = backendBase.startsWith("http://") || backendBase.startsWith("https://");

    if (!validBase) {
      return Response.json(
        isDev ? { error: "BACKEND_URL is invalid", value: rawBase } : { error: "BACKEND_URL is invalid" },
        { status: 500 }
      );
    }
    const backendUrl = `${backendBase}/me/permissions`;

    const hasIncomingAuthHeader = !!headerAuth;
    const hasAccessTokenCookie = !!cookieToken;
    if (!hasIncomingAuthHeader && !hasAccessTokenCookie) {
      if (isDev) {
        console.log(
          `[me/permissions] Dev diagnostics: hasIncomingAuthHeader=${hasIncomingAuthHeader}, hasAccessTokenCookie=${hasAccessTokenCookie}, backendBase=${backendBase}, backendUrl=${backendUrl}`
        );
      }
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const headers = new Headers();
    headers.set("cache-control", "no-store");
    if (headerAuth) {
      headers.set("Authorization", headerAuth);
    } else if (cookieToken) {
      headers.set("Authorization", `Bearer ${cookieToken}`);
    }
    if (ifNoneMatch) headers.set("If-None-Match", ifNoneMatch);

    if (isDev) {
      console.log(
        `[me/permissions] Dev diagnostics: hasIncomingAuthHeader=${hasIncomingAuthHeader}, hasAccessTokenCookie=${hasAccessTokenCookie}, backendBase=${backendBase}, backendUrl=${backendUrl}`
      );
    }

    const res = await fetch(backendUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

  const etag = res.headers.get("ETag");
  const contentType = res.headers.get("content-type") ?? "application/json";

  if (res.status === 304) {
    const out = new Response(null, { status: 304 });
    if (etag) out.headers.set("ETag", etag);
    return out;
  }

  const text = await res.text();
  const out = new Response(text, { status: res.status });
  out.headers.set("content-type", contentType);
  if (etag) out.headers.set("ETag", etag);
  return out;
  } catch (err) {
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) {
      console.log(`[me/permissions] Dev diagnostics: fetch error=${String(err)}`);
    }
    return Response.json({ error: "Backend unavailable", ...(isDev ? { detail: String(err) } : {}) }, { status: 502 });
  }
}
