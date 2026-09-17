import { formatOf, streamBinary } from "@/api/utils/exportResponse";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";

// Mutations go through server actions; reads go through these methods only where a route handler exists.
export class PublicHolidayCalendarsRoutes {
  public async list(_req: Request) {
    const data = await hrisPublicHolidayCalendarsService.list();
    return Response.json(data);
  }

  public async getById(_req: Request, id: string) {
    const data = await hrisPublicHolidayCalendarsService.getById(id);
    return Response.json(data);
  }

  public async exportCalendars(req: Request) {
    const backendResponse = await hrisPublicHolidayCalendarsService.exportCalendars(formatOf(req));
    return streamBinary(backendResponse);
  }

  public async exportCalendar(req: Request, id: string) {
    const backendResponse = await hrisPublicHolidayCalendarsService.exportCalendar(id, formatOf(req));
    return streamBinary(backendResponse);
  }
}

export const publicHolidayCalendarsRoutes =
  new PublicHolidayCalendarsRoutes();
