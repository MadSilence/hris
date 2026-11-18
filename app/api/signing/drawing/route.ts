import { hrisApiSigningService } from "@/api/modules/signing/services";
import { isSigningParty } from "@/api/modules/signing/dto";

/**
 * The drawing the phone sent, asked every few seconds while the signer's screen waits (G03e). A POST for the same
 * reason as the PDF: a token travels in the body.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const party = body?.party;
  if (!isSigningParty(party)) return new Response(null, { status: 400 });
  try {
    const data =
      party.kind === "member"
        ? await hrisApiSigningService.drawing(party.envelopeId)
        : party.kind === "guest"
          ? await hrisApiSigningService.guestDrawing(party.token)
          : await hrisApiSigningService.joinerDrawing(party.token, party.taskId);
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ drawing: null, at: null }, { status: 200 });
  }
}
