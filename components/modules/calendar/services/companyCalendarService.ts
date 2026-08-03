import { internalApiClient } from "@/components/clients/apiClient";
import type { CompanyCalendarPage } from "@/models/calendar";

export type CompanyCalendarQuery = {
  from: string;
  to: string;
  cursor?: string;
  limit?: number;
  q?: string;
};

export class CompanyCalendarService {
  public async company(params: CompanyCalendarQuery): Promise<CompanyCalendarPage> {
    const qs = new URLSearchParams();
    qs.set("from", params.from);
    qs.set("to", params.to);
    if (params.cursor) qs.set("cursor", params.cursor);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.q) qs.set("q", params.q);

    return internalApiClient.get<CompanyCalendarPage>(`/calendar/company?${qs.toString()}`);
  }
}

export const companyCalendarService = new CompanyCalendarService();
