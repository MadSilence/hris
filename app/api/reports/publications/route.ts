import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { reportsRoutes } from "@/api/modules/reports/routes";

/** One report's publications (`?reportId=`), or every publication of the company. */
export const GET = apiRequestWrapper(async (req: Request) => reportsRoutes.publications(req));
