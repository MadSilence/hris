import { CreateResponse } from "@/api/models/misc";
import { hrisApiCompanyLogoClient } from "@/api/modules/company/modules/companyLogo/clients";

export class HrisCompanyLogoService {
  public async uploadLogo(file: File): Promise<CreateResponse> {
    return hrisApiCompanyLogoClient.uploadLogo(file);
  }

  public async deleteLogo(): Promise<void> {
    return hrisApiCompanyLogoClient.deleteLogo();
  }
}

export const hrisCompanyLogoService = new HrisCompanyLogoService();
