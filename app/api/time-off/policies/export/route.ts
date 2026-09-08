import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPoliciesRoutes } from "@/api/modules/timeOff/timeOffPolicies/routes";

/** Streams a spreadsheet, so it stays a route handler — a server action cannot stream. */
export const GET = apiRequestWrapper(async (req: Request) =>
  timeOffPoliciesRoutes.exportPolicies(req),
);
