import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPoliciesRoutes } from "@/api/modules/timeOff/timeOffPolicies/routes";

export const GET = apiRequestWrapper(async (req: Request) =>
  timeOffPoliciesRoutes.list(req),
);

export const POST = apiRequestWrapper(async (req: Request) =>
  timeOffPoliciesRoutes.create(req),
);
