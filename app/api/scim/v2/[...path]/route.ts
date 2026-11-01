import { type NextRequest } from "next/server";
import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import publicConfig from "@/config/publicConfig";
import { parseHost, requestHost } from "@/lib/companyAddress";

/**
 * The SCIM endpoint the IdP calls — `https://<company>.<root>/api/scim/v2` — passed to Java unchanged. A
 * pass-through and nothing more: no session, no check of its own (not a third security check), and the
 * `Authorization` header never logged (R2 point 4). The company is the host's, for Java to compare with the
 * token's (A10).
 */
const pass = async (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => {
  const host = parseHost(requestHost(req.headers), publicConfig.web.rootDomain);
  if (host.kind !== "company") {
    return Response.json({ schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"], status: "404", detail: "Not found" }, { status: 404 });
  }
  const { path } = await ctx.params;
  const query = req.nextUrl.search;
  const body = req.method === "GET" || req.method === "DELETE" ? undefined : await req.text();
  const upstream = await hrisApiClient.scim(`/scim/v2/${path.map(encodeURIComponent).join("/")}${query}`, {
    method: req.method,
    body,
    authorization: req.headers.get("authorization") ?? undefined,
    contentType: req.headers.get("content-type") ?? undefined,
    subdomain: host.subdomain,
  });
  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "application/scim+json");
  const retry = upstream.headers.get("retry-after");
  if (retry) headers.set("Retry-After", retry);
  return new Response(upstream.status === 204 ? null : await upstream.text(), { status: upstream.status, headers });
};

export const GET = pass;
export const POST = pass;
export const PUT = pass;
export const PATCH = pass;
export const DELETE = pass;
