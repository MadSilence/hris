import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { leaveTypesRoutes } from "@/api/modules/timeOff/leaveTypes/routes";

export const GET = apiRequestWrapper(async (req: Request) =>
  leaveTypesRoutes.list(req),
);
