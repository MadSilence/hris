import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { employeeTimeOffBalancesRoutes } from "@/api/modules/timeOff/employeeTimeOffBalances/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return employeeTimeOffBalancesRoutes.listByUserId(req, id);
});
