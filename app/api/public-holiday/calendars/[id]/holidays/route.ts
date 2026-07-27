import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { publicHolidaysRoutes } from "@/api/modules/publicHolidays/holidays/routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return publicHolidaysRoutes.list(req, id);
});

export const POST = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return publicHolidaysRoutes.create(req, id);
});
