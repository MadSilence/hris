import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiSigningService } from "@/api/modules/signing/services";

/** A document's signing history across all its signings, oldest first (documents-send-for-signature S13). */
export const GET = apiRequestWrapper(async (req: Request) => {
  const documentId = new URL(req.url).searchParams.get("documentId") ?? "";
  return Response.json(await hrisApiSigningService.history(documentId));
});
