import { hrisApiCompanyService } from "@/api/modules/company/services/hrisCompanyService";

export class CompanyRoutes {
  public async getCompany() {
    const company = await hrisApiCompanyService.getCompany();
    return Response.json(company);
  }
}

export const companyRoutes = new CompanyRoutes();
