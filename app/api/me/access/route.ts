import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { BACKEND_UNAVAILABLE_CODE } from "@/components/clients/exceptions";

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
    // Being a raw proxy costs this route the shared error shape, so it has to say the same thing by
    // hand. Without `code` the client builds an error the dictionary cannot read, and the region
    // shows "An error occurred. Please try again." for what is plainly an unreachable backend —
    // 502 with a bare `error` field was doing exactly that.
    const isDev = process.env.NODE_ENV !== "production";
    return Response.json(
      {
        status: 503,
        error: "BackendUnavailableError",
        code: BACKEND_UNAVAILABLE_CODE,
        message: `Cannot reach the API at ${process.env.BACKEND_URL} — is the backend running?`,
        ...(isDev ? { detail: String(err) } : {}),
      },
      { status: 503 },
    );
  }
}
