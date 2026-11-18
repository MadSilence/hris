import { hrisApiSigningService } from "@/api/modules/signing/services";

/** A guest's signed copy (documents-signing G12), streamed; the link's token travels in the body. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token) return new Response(null, { status: 400 });
  try {
    const upstream = await hrisApiSigningService.guestCopy(token);
    return new Response(upstream.body, {
      status: 200,
      headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
