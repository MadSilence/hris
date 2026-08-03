import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { CompanyCalendarPage } from "@/models/calendar";

export type CompanyCalendarQuery = {
  from: string;
  to: string;
  cursor?: string;
  limit?: number;
  q?: string;
};

export class HrisApiCompanyCalendarClient {
  private readonly BASE_PATH = "/calendar/company";

  public async company(params: CompanyCalendarQuery): Promise<CompanyCalendarPage> {
    const qs = new URLSearchParams();
    qs.set("from", params.from);
    qs.set("to", params.to);
    if (params.cursor) qs.set("cursor", params.cursor);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.q) qs.set("q", params.q);

    return hrisApiClient.get<CompanyCalendarPage>(`${this.BASE_PATH}?${qs.toString()}`);
  }
}

export const hrisApiCompanyCalendarClient = new HrisApiCompanyCalendarClient();
