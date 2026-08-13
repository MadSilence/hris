import { internalApiClient } from "@/components/clients/apiClient";
import type { CompanySettings } from "@/models/company/CompanySettings";

export class CompanySettingsService {
  public async get(): Promise<CompanySettings> {
    return internalApiClient.get<CompanySettings>("/company/settings");
  }
}

export const companySettingsService = new CompanySettingsService();
