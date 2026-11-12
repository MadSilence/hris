import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { reportsRoutes } from "@/api/modules/reports/routes";

/** The reports this person may open: their own and those shared with them. */
export const GET = apiRequestWrapper(async () => reportsRoutes.list());
