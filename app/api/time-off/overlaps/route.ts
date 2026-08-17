import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffRequestsRoutes } from "@/api/modules/timeOff/timeOffRequests/routes";

export const GET = apiRequestWrapper(async (req: Request) => {
  return timeOffRequestsRoutes.listOverlaps(req);
});
