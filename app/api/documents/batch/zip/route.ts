import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { documentsRoutes } from "@/api/modules/documents/routes/documentsRoutes";

export const GET = apiRequestWrapper(async (req: Request) => documentsRoutes.downloadZip(req));
