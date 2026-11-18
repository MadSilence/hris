import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiSigningService } from "@/api/modules/signing/services";

/** The company's document templates — what a signing step or a Sign task picks from (DOCUMENTS_PLAN.md 9.7). */
export const GET = apiRequestWrapper(async () => Response.json(await hrisApiSigningService.templates()));
