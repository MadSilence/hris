import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { publicHolidayCalendarsRoutes } from "@/api/modules/publicHolidays/calendars/routes";

export const GET = apiRequestWrapper(async (req: Request) =>
  publicHolidayCalendarsRoutes.exportCalendars(req),
);
