import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";

export class PublicHolidayCalendarsRoutes {
  public async create(req: Request) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisPublicHolidayCalendarsService.create({
      name: body.name,
      year: body.year,
      status: body.status,
      sourceType: body.sourceType,
      sourceExternalId: body.sourceExternalId ?? null,
      sourceCountryCode: body.sourceCountryCode ?? null,
      sourceRegionCode: body.sourceRegionCode ?? null,
      sourceLocale: body.sourceLocale ?? null,
    });

    return Response.json(data);
  }

  public async list(_req: Request) {
    const data = await hrisPublicHolidayCalendarsService.list();
    return Response.json(data);
  }

  public async getById(_req: Request, id: string) {
    const data = await hrisPublicHolidayCalendarsService.getById(id);
    return Response.json(data);
  }

  public async update(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisPublicHolidayCalendarsService.update(id, {
      name: body.name,
      year: body.year,
      sourceType: body.sourceType,
      sourceExternalId: body.sourceExternalId ?? null,
      sourceCountryCode: body.sourceCountryCode ?? null,
      sourceRegionCode: body.sourceRegionCode ?? null,
      sourceLocale: body.sourceLocale ?? null,
    });

    return Response.json(data);
  }

  public async rename(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisPublicHolidayCalendarsService.rename(id, {
      name: body.name,
    });

    return Response.json(data);
  }

  public async activate(_req: Request, id: string) {
    const data = await hrisPublicHolidayCalendarsService.activate(id);
    return Response.json(data);
  }

  public async deactivate(_req: Request, id: string) {
    const data = await hrisPublicHolidayCalendarsService.deactivate(id);
    return Response.json(data);
  }

  public async archive(_req: Request, id: string) {
    const data = await hrisPublicHolidayCalendarsService.archive(id);
    return Response.json(data);
  }

  public async delete(_req: Request, id: string) {
    await hrisPublicHolidayCalendarsService.delete(id);
    return new Response(null, { status: 204 });
  }
}

export const publicHolidayCalendarsRoutes =
  new PublicHolidayCalendarsRoutes();
