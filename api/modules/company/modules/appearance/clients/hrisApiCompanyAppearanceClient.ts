import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { companyMapper } from "@/api/modules/company/mappers/companyMapper";
import { CompanyAppearance } from "@/models/company/CompanyAppearance";
import type { PublicCompanyAppearance } from "@/models/company/PublicCompanyAppearance";
import {
  CompanyAppearanceDTO,
  PublicCompanyAppearanceDTO,
  UpdateCompanyAppearanceRequest,
} from "@/api/modules/company/modules/appearance/dto/CompanyAppearanceDTO";

export class HrisApiCompanyAppearanceClient {
  private readonly BASE_PATH = "/company/appearance";

  public async getAppearance(): Promise<CompanyAppearance> {
    return this.toModel(await hrisApiClient.get<CompanyAppearanceDTO>(this.BASE_PATH));
  }

  public async updateAppearance(body: UpdateCompanyAppearanceRequest): Promise<CompanyAppearance> {
    return this.toModel(
      await hrisApiClient.put<CompanyAppearanceDTO, UpdateCompanyAppearanceRequest>(this.BASE_PATH, body),
    );
  }

  /** Without a session: the login page of the company at this address. No Bearer travels with it. */
  public async getPublicAppearance(subdomain: string): Promise<PublicCompanyAppearance> {
    const dto = await hrisApiClient.get<PublicCompanyAppearanceDTO>(
      `/public/company-appearance/${encodeURIComponent(subdomain)}`,
    );
    return {
      accent: dto?.accent ?? null,
      background: dto?.background === "LIGHT" ? "LIGHT" : "COLOR",
      logoColors: dto?.logoColors ?? [],
      logoUrl: companyMapper.resolveBackendAssetUrl(dto?.logoUrl),
      language: dto?.language ?? null,
      name: dto?.name ?? null,
    };
  }

  private toModel(dto: CompanyAppearanceDTO): CompanyAppearance {
    return {
      accent: dto.accent ?? null,
      background: dto.background === "LIGHT" ? "LIGHT" : "COLOR",
      backgroundChosen: dto.backgroundChosen ?? false,
      logoColors: dto.logoColors ?? [],
      // Named here because this mapper lists its fields: left out, the form would never have a
      // version to send back, and every save would skip the check silently.
      version: dto.version,
    };
  }
}

export const hrisApiCompanyAppearanceClient = new HrisApiCompanyAppearanceClient();
