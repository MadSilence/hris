import { hrisApiHolidayCalendarBindingsClient } from "@/api/modules/publicHolidays/bindings/clients";
import type {
  HolidayCalendarBinding,
  HolidayCalendarBindingKind,
  HolidayCalendarBindingPreview,
  HolidayCalendarBindingRequest,
} from "@/models/publicHolidays/binding";

/**
 * Who gets which holiday calendar (PUBLIC_HOLIDAYS.md § "Who gets which calendar"): a calendar bound to an
 * office, a legal entity or the company default. Java decides what binding means — this only carries it.
 */
export class HrisHolidayCalendarBindingsService {
  public async get(kind: HolidayCalendarBindingKind, refId: string | null): Promise<HolidayCalendarBinding> {
    return hrisApiHolidayCalendarBindingsClient.get(kind, refId);
  }

  public async preview(body: HolidayCalendarBindingRequest): Promise<HolidayCalendarBindingPreview> {
    return hrisApiHolidayCalendarBindingsClient.preview(body);
  }

  public async set(body: HolidayCalendarBindingRequest): Promise<HolidayCalendarBinding> {
    return hrisApiHolidayCalendarBindingsClient.set(body);
  }
}

export const hrisHolidayCalendarBindingsService = new HrisHolidayCalendarBindingsService();
