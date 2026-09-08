import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffRequestsRoutes } from "@/api/modules/timeOff/timeOffRequests/routes";

export const GET = apiRequestWrapper(async (req: Request) =>
  timeOffRequestsRoutes.listAwaitingMe(req),
);
