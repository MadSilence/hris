import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";

export class PublicHolidaysRoutes {
  public async create(req: Request, calendarId: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisPublicHolidaysService.create(calendarId, {
      name: body.name,
      holidayDate: body.holidayDate,
    });

    return Response.json(data);
  }

  public async list(_req: Request, calendarId: string) {
    const data = await hrisPublicHolidaysService.list(calendarId);
    return Response.json(data);
  }

  public async getById(_req: Request, id: string) {
    const data = await hrisPublicHolidaysService.getById(id);
    return Response.json(data);
  }

  public async update(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisPublicHolidaysService.update(id, {
      name: body.name,
      holidayDate: body.holidayDate,
    });

    return Response.json(data);
  }

  public async rename(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisPublicHolidaysService.rename(id, {
      name: body.name,
    });

    return Response.json(data);
  }

  public async delete(_req: Request, id: string) {
    await hrisPublicHolidaysService.delete(id);
    return new Response(null, { status: 204 });
  }
}

export const publicHolidaysRoutes = new PublicHolidaysRoutes();
