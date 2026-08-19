import { CompanyAppearance } from "@/models/company/CompanyAppearance";
import { UpdateCompanyAppearanceRequest } from "@/api/modules/company/modules/appearance/dto";
import { hrisApiCompanyAppearanceClient } from "@/api/modules/company/modules/appearance/clients";

/**
 * The convergence point for every transport that touches appearance: the settings route handler, the
 * save/upload server actions, and the root layout's server-side read that paints the brand before
 * first render.
 */
export class HrisCompanyAppearanceService {
  public async getAppearance(): Promise<CompanyAppearance> {
    return hrisApiCompanyAppearanceClient.getAppearance();
  }

  public async updateAppearance(body: UpdateCompanyAppearanceRequest): Promise<CompanyAppearance> {
    return hrisApiCompanyAppearanceClient.updateAppearance(body);
  }

  public async uploadLoginImage(file: File): Promise<CompanyAppearance> {
    return hrisApiCompanyAppearanceClient.uploadLoginImage(file);
  }

  public async deleteLoginImage(): Promise<CompanyAppearance> {
    return hrisApiCompanyAppearanceClient.deleteLoginImage();
  }
}

export const hrisCompanyAppearanceService = new HrisCompanyAppearanceService();
