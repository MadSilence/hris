import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";

export class PublicHolidaysRoutes {
  public async list(req: Request, calendarId: string) {
    const year = new URL(req.url).searchParams.get("year");

    const data = await hrisPublicHolidaysService.list(
      calendarId,
      year ? Number(year) : undefined
    );

    return Response.json(data);
  }
}

export const publicHolidaysRoutes = new PublicHolidaysRoutes();
