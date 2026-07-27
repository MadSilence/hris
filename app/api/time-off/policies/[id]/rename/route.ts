import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPoliciesRoutes } from "@/api/modules/timeOff/timeOffPolicies/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const POST = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPoliciesRoutes.rename(req, id);
});
