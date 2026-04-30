import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { companyMapper } from "@/api/modules/company/mappers/companyMapper";
import { Company } from "@/models/company/Company";
import { CompanyDTO } from "@/api/modules/company/dto/CompanyDTO";

export class HrisApiCompanyClient {
  private readonly BASE_PATH = "/company";

  public async getCompany(): Promise<Company> {
    const dto = await hrisApiClient.get<CompanyDTO>(this.BASE_PATH);
    return companyMapper.mapCompanyDTOtoCompany(dto);
  }
}

export const hrisApiCompanyClient = new HrisApiCompanyClient();
