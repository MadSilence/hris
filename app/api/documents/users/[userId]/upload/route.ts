import { cookies } from "next/headers";
import publicConfig from "@/config/publicConfig";
import { NextRequest } from "next/server";
import { ACCESS_COOKIE } from "@/config/security/sessionCookieNames";
import { backendTunnelHeaders } from "@/config/backendTunnel";

const BASE_URL =
  process.env.BACKEND_URL ||
  (() => {
    const issuer = new URL(publicConfig.auth.issuerUri);
    return issuer.origin;
  })();

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value ?? "";

  const formData = await req.formData();

  const response = await fetch(`${BASE_URL}/documents/users/${userId}/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // TEMPORARY — the ngrok tunnel; remove with config/backendTunnel.ts.
      ...backendTunnelHeaders(),
    },
    body: formData,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "application/json";

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": contentType,
    },
  });
}
