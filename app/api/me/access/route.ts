import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// Raw proxy (instead of hrisApiClient) so ETag / If-None-Match / 304 pass through untouched.
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("access_token")?.value ?? "";
    const headerAuth = req.headers.get("authorization") || "";
    const ifNoneMatch = req.headers.get("if-none-match");

    const rawBase = process.env.BACKEND_URL ?? null;
    if (!rawBase) {
      return Response.json({ error: "BACKEND_URL is not set" }, { status: 500 });
    }
    const backendBase = rawBase.replace(/\/+$/, "");
    if (!backendBase.startsWith("http://") && !backendBase.startsWith("https://")) {
      return Response.json({ error: "BACKEND_URL is invalid" }, { status: 500 });
    }

    if (!headerAuth && !cookieToken) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const headers = new Headers();
    headers.set("cache-control", "no-store");
    headers.set("Authorization", headerAuth || `Bearer ${cookieToken}`);
    if (ifNoneMatch) headers.set("If-None-Match", ifNoneMatch);

    const res = await fetch(`${backendBase}/me/access`, {
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
    return Response.json(
      { error: "Backend unavailable", ...(isDev ? { detail: String(err) } : {}) },
      { status: 502 },
    );
  }
}
