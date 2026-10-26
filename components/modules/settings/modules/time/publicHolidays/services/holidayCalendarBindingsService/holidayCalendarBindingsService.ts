import { internalApiClient } from "@/components/clients/apiClient";
import type { HolidayCalendarBinding, HolidayCalendarBindingKind } from "@/models/publicHolidays/binding";

export class HolidayCalendarBindingsService {
  /** The Holiday Calendar field of an office, a legal entity, or (no `refId`) the company default. */
  public async get(kind: HolidayCalendarBindingKind, refId: string | null): Promise<HolidayCalendarBinding> {
    const query = refId ? `?refId=${encodeURIComponent(refId)}` : "";
    return internalApiClient.get<HolidayCalendarBinding>(`/public-holiday/bindings/${kind}${query}`);
  }
}

export const holidayCalendarBindingsService = new HolidayCalendarBindingsService();
