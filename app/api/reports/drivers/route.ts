import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { reportsRoutes } from "@/api/modules/reports/routes";

/** POST for a read: a measure's change broken down by every dimension the caller may use. */
export const POST = apiRequestWrapper(async (req: Request) => reportsRoutes.drivers(req));
