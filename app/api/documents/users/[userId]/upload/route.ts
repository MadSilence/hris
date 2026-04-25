import { cookies } from "next/headers";
import publicConfig from "@/config/publicConfig";
import { NextRequest } from "next/server";

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
  const token = cookieStore.get("access_token")?.value ?? "";

  const formData = await req.formData();

  const response = await fetch(`${BASE_URL}/documents/users/${userId}/upload`, {
    method: "POST",
    headers: token
      ? {
        Authorization: `Bearer ${token}`,
      }
      : undefined,
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
