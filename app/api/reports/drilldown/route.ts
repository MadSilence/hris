import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { reportsRoutes } from "@/api/modules/reports/routes";

/** POST for a read: the people behind a group, asked with the definition and the group's key. */
export const POST = apiRequestWrapper(async (req: Request) => reportsRoutes.drilldown(req));
