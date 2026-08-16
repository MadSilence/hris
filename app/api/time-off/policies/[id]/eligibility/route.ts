import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPolicyEligibilityRoutes } from "@/api/modules/timeOff/timeOffPolicyEligibility/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPolicyEligibilityRoutes.getByPolicyId(req, id);
});
