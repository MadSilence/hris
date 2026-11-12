import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { reportsRoutes } from "@/api/modules/reports/routes";

/** An unsaved definition as a file, streamed through as Java wrote it; `?format=csv|xlsx`. */
export const POST = apiRequestWrapper(async (req: Request) => reportsRoutes.exportUnsaved(req));
