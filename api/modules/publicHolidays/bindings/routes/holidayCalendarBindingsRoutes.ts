import { hrisHolidayCalendarBindingsService } from "@/api/modules/publicHolidays/bindings/services";
import type { HolidayCalendarBindingKind } from "@/models/publicHolidays/binding";

const KINDS: readonly HolidayCalendarBindingKind[] = ["OFFICE", "LEGAL_ENTITY", "COMPANY_DEFAULT"];

export class HolidayCalendarBindingsRoutes {
  /** The field as it stands, for an office, a legal entity (`?refId=`) or the company default. */
  public async get(req: Request, kind: string) {
    if (!KINDS.includes(kind as HolidayCalendarBindingKind)) {
      return Response.json({ message: "Unknown binding kind" }, { status: 404 });
    }
    const refId = new URL(req.url).searchParams.get("refId");
    const data = await hrisHolidayCalendarBindingsService.get(kind as HolidayCalendarBindingKind, refId);
    return Response.json(data);
  }
}

export const holidayCalendarBindingsRoutes = new HolidayCalendarBindingsRoutes();
