import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { holidayCalendarBindingsRoutes } from "@/api/modules/publicHolidays/bindings/routes";

type RouteContext = {
  params: Promise<{ kind: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { kind } = await context.params;
  return holidayCalendarBindingsRoutes.get(req, kind);
});
