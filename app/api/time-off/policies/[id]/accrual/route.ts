import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPolicyAccrualRoutes } from "@/api/modules/timeOff/timeOffPolicyAccrual/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPolicyAccrualRoutes.getByPolicyId(req, id);
});
