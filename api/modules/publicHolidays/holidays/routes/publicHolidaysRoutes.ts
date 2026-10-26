import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";

const yearOf = (req: Request): number | undefined => {
  const year = new URL(req.url).searchParams.get("year");
  return year ? Number(year) : undefined;
};

export class PublicHolidaysRoutes {
  public async list(req: Request, calendarId: string) {
    const data = await hrisPublicHolidaysService.list(calendarId, yearOf(req));

    return Response.json(data);
  }

  /** The company's overrides of the provider's days, read beside the days on the calendar screen. */
  public async listOverrides(req: Request, calendarId: string) {
    const data = await hrisPublicHolidaysService.listOverrides(calendarId, yearOf(req));

    return Response.json(data);
  }
}

export const publicHolidaysRoutes = new PublicHolidaysRoutes();
