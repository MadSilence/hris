import { hrisApiSigningService } from "@/api/modules/signing/services";
import { isSigningParty } from "@/api/modules/signing/dto";

/**
 * The document a signer reads (documents-signing G02, G09, P08), streamed. A POST because a guest's and a joiner's
 * token is a credential and travels in the body, never in a URL. Bare, like the other binary passthroughs: the
 * backend answers who may read it — a signer while asked, whatever the document's visibility.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const party = body?.party;
  if (!isSigningParty(party)) return new Response(null, { status: 400 });
  try {
    const upstream =
      party.kind === "member"
        ? await hrisApiSigningService.pdf(party.envelopeId)
        : party.kind === "guest"
          ? await hrisApiSigningService.guestPdf(party.token)
          : await hrisApiSigningService.joinerPdf(party.token, party.taskId);
    return new Response(upstream.body, {
      status: 200,
      headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
