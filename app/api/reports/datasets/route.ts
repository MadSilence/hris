import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { reportsRoutes } from "@/api/modules/reports/routes";

/** A dataset's fields and measures, as this reader may use them (`?dataset=`; PEOPLE when absent). */
export const GET = apiRequestWrapper(async (req: Request) => reportsRoutes.datasets(req));
