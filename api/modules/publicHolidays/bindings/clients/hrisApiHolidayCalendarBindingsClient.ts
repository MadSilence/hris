import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  HolidayCalendarBinding,
  HolidayCalendarBindingKind,
  HolidayCalendarBindingPreview,
  HolidayCalendarBindingRequest,
} from "@/models/publicHolidays/binding";

/** The Holiday Calendar field of an office, a legal entity and the company default. */
export class HrisApiHolidayCalendarBindingsClient {
  public async get(kind: HolidayCalendarBindingKind, refId: string | null): Promise<HolidayCalendarBinding> {
    const query = refId ? `?refId=${encodeURIComponent(refId)}` : "";
    return hrisApiClient.get<HolidayCalendarBinding>(`/public-holiday-bindings/${kind}${query}`);
  }

  public async preview(body: HolidayCalendarBindingRequest): Promise<HolidayCalendarBindingPreview> {
    return hrisApiClient.post<HolidayCalendarBindingPreview>("/public-holiday-bindings/preview", body);
  }

  /** Sets, changes or clears the field; the firings due today are applied before it answers. */
  public async set(body: HolidayCalendarBindingRequest): Promise<HolidayCalendarBinding> {
    return hrisApiClient.put<HolidayCalendarBinding, HolidayCalendarBindingRequest>("/public-holiday-bindings", body);
  }
}

export const hrisApiHolidayCalendarBindingsClient = new HrisApiHolidayCalendarBindingsClient();
