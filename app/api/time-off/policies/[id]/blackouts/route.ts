import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPolicyBlackoutsRoutes } from "@/api/modules/timeOff/timeOffPolicyBlackouts/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPolicyBlackoutsRoutes.getByPolicyId(req, id);
});
