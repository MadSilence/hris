import { internalApiClient } from "@/components/clients/apiClient";
import type { CompanyAppearance } from "@/models/company/CompanyAppearance";

export class CompanyAppearanceService {
  public async get(): Promise<CompanyAppearance> {
    return internalApiClient.get<CompanyAppearance>("/company/appearance");
  }
}

export const companyAppearanceService = new CompanyAppearanceService();
