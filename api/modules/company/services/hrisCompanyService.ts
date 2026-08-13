import { Company } from "@/models/company/Company";
import { CompanySettings } from "@/models/company/CompanySettings";
import {
  UpdateCompanyRequest,
  UpdateCompanySettingsRequest,
} from "@/api/modules/company/dto/CompanyDTO";
import { hrisApiCompanyClient } from "@/api/modules/company/clients/hrisApiCompanyClient";

export class HrisApiCompanyService {
  public async getCompany(): Promise<Company> {
    return hrisApiCompanyClient.getCompany();
  }

  public async updateCompany(body: UpdateCompanyRequest): Promise<Company> {
    return hrisApiCompanyClient.updateCompany(body);
  }

  public async getSettings(): Promise<CompanySettings> {
    return hrisApiCompanyClient.getSettings();
  }

  public async updateSettings(body: UpdateCompanySettingsRequest): Promise<CompanySettings> {
    return hrisApiCompanyClient.updateSettings(body);
  }
}

export const hrisApiCompanyService = new HrisApiCompanyService();
