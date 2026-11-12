import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { reportsRoutes } from "@/api/modules/reports/routes";

/** The gallery: every report template made concrete for this company. Applying one is `/templates/{key}/apply`. */
export const GET = apiRequestWrapper(async () => reportsRoutes.templates());
