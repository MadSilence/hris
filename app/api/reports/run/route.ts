import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { reportsRoutes } from "@/api/modules/reports/routes";

/** POST for a read: an unsaved definition — the builder, a template tried before applying. */
export const POST = apiRequestWrapper(async (req: Request) => reportsRoutes.run(req));
