import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPolicyRestrictionsRoutes } from "@/api/modules/timeOff/timeOffPolicyRestrictions/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPolicyRestrictionsRoutes.listByPolicyId(req, id);
});
