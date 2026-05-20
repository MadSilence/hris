import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { publicHolidayCalendarsRoutes } from "@/api/modules/publicHolidays/calendars/routes";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;

  return publicHolidayCalendarsRoutes.getById(req, id);
});

export const PUT = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;

  return publicHolidayCalendarsRoutes.update(req, id);
});

export const DELETE = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;

  return publicHolidayCalendarsRoutes.delete(req, id);
});
