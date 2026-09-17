import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { activityLogRoutes } from "@/api/modules/activityLog/routes";

export const GET = apiRequestWrapper(async (req: Request) => activityLogRoutes.export(req));
