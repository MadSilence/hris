import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPoliciesRoutes } from "@/api/modules/timeOff/timeOffPolicies/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPoliciesRoutes.getById(req, id);
});

export const PATCH = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPoliciesRoutes.update(req, id);
});
