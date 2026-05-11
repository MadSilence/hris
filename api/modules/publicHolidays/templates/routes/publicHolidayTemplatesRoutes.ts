import { hrisPublicHolidayTemplatesService } from "@/api/modules/publicHolidays/templates/services";

export class PublicHolidayTemplatesRoutes {
  public async list(_req: Request) {
    const data = await hrisPublicHolidayTemplatesService.list();
    return Response.json(data);
  }

  public async getById(_req: Request, id: string) {
    const data = await hrisPublicHolidayTemplatesService.getById(id);
    return Response.json(data);
  }

  public async preview(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisPublicHolidayTemplatesService.preview(id, {
      year: body.year,
    });

    return Response.json(data);
  }
}

export const publicHolidayTemplatesRoutes =
  new PublicHolidayTemplatesRoutes();
