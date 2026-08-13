import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPolicyAssignmentsRoutes } from "@/api/modules/timeOff/timeOffPolicyAssignments/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPolicyAssignmentsRoutes.listByPolicyId(req, id);
});
