import { hrisApiCompanyService } from "@/api/modules/company/services/hrisCompanyService";

export class CompanyRoutes {
  public async getCompany() {
    const company = await hrisApiCompanyService.getCompany();
    return Response.json(company);
  }

  public async getSettings() {
    const settings = await hrisApiCompanyService.getSettings();
    return Response.json(settings);
  }
}

export const companyRoutes = new CompanyRoutes();
