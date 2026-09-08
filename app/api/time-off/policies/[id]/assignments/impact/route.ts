import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { timeOffPolicyAssignmentsRoutes } from "@/api/modules/timeOff/timeOffPolicyAssignments/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * A read, shaped as a POST because the question is asked about a list of people.
 *
 * It changes nothing: it answers "what would assigning this policy to these people produce", which is
 * the warning that comes before the action rather than the refusal that comes after it.
 */
export const POST = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return timeOffPolicyAssignmentsRoutes.impact(req, id);
});
