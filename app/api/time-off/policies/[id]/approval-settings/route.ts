import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPolicyApprovalSettingsRoutes } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPolicyApprovalSettingsRoutes.getByPolicyId(req, id);
});
