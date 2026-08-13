import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { companyMapper } from "@/api/modules/company/mappers/companyMapper";
import { Company } from "@/models/company/Company";
import { CompanySettings } from "@/models/company/CompanySettings";
import {
  CompanyDTO,
  CompanySettingsDTO,
  UpdateCompanyRequest,
  UpdateCompanySettingsRequest,
} from "@/api/modules/company/dto/CompanyDTO";

export class HrisApiCompanyClient {
  private readonly BASE_PATH = "/company";

  public async getCompany(): Promise<Company> {
    const dto = await hrisApiClient.get<CompanyDTO>(this.BASE_PATH);
    return companyMapper.mapCompanyDTOtoCompany(dto);
  }

  public async updateCompany(body: UpdateCompanyRequest): Promise<Company> {
    const dto = await hrisApiClient.put<CompanyDTO, UpdateCompanyRequest>(this.BASE_PATH, body);
    return companyMapper.mapCompanyDTOtoCompany(dto);
  }

  public async getSettings(): Promise<CompanySettings> {
    return hrisApiClient.get<CompanySettingsDTO>(`${this.BASE_PATH}/settings`);
  }

  public async updateSettings(body: UpdateCompanySettingsRequest): Promise<CompanySettings> {
    return hrisApiClient.put<CompanySettingsDTO, UpdateCompanySettingsRequest>(
      `${this.BASE_PATH}/settings`,
      body,
    );
  }
}

export const hrisApiCompanyClient = new HrisApiCompanyClient();
