import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { publicHolidayTemplatesRoutes } from "@/api/modules/publicHolidays/templates/routes";

export const GET = apiRequestWrapper(async (req: Request) =>
  publicHolidayTemplatesRoutes.list(req),
);
