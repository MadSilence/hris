import { hrisCompanyAppearanceService } from "@/api/modules/company/modules/appearance/services";

export class CompanyAppearanceRoutes {
  public async getAppearance() {
    const appearance = await hrisCompanyAppearanceService.getAppearance();
    return Response.json(appearance);
  }
}

export const companyAppearanceRoutes = new CompanyAppearanceRoutes();
