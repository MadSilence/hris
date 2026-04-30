import { Company } from "@/models/company/Company";
import { hrisApiCompanyClient } from "@/api/modules/company/clients/hrisApiCompanyClient";

export class HrisApiCompanyService {
  public async getCompany(): Promise<Company> {
    return hrisApiCompanyClient.getCompany();
  }
}

export const hrisApiCompanyService = new HrisApiCompanyService();
