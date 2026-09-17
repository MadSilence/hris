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

  public async uploadLoginImage(file: File): Promise<CompanyAppearance> {
    const formData = new FormData();
    formData.append("file", file);

    return this.toModel(
      await hrisApiClient.postForm<CompanyAppearanceDTO>(`${this.BASE_PATH}/login-image`, formData),
    );
  }

  public async deleteLoginImage(): Promise<CompanyAppearance> {
    return this.toModel(
      await hrisApiClient.post<CompanyAppearanceDTO>(`${this.BASE_PATH}/login-image/delete`),
    );
  }

  /** Without a session: the login page of the company at this address. No Bearer travels with it. */
  public async getPublicAppearance(subdomain: string): Promise<PublicCompanyAppearance> {
    const dto = await hrisApiClient.get<PublicCompanyAppearanceDTO>(
      `/public/company-appearance/${encodeURIComponent(subdomain)}`,
    );
    return {
      brandColor: dto?.brandColor ?? null,
      loginHeadline: dto?.loginHeadline ?? null,
      loginSubheadline: dto?.loginSubheadline ?? null,
      loginImageUrl: companyMapper.resolveBackendAssetUrl(dto?.loginImageUrl),
    };
  }

  /** The backend returns a backend-relative `/uploads/...` path; the browser needs an absolute URL. */
  private toModel(dto: CompanyAppearanceDTO): CompanyAppearance {
    return {
      brandColor: dto.brandColor ?? null,
      loginImageUrl: companyMapper.resolveBackendAssetUrl(dto.loginImageUrl),
      loginHeadline: dto.loginHeadline ?? null,
      loginSubheadline: dto.loginSubheadline ?? null,
      // Defaulted rather than trusted: a backend older than V23 omits them, and an unplaced image is
      // shown nowhere.
      useImageOnLogin: dto.useImageOnLogin ?? false,
      useImageOnDashboard: dto.useImageOnDashboard ?? false,
      sidebarContrast: dto.sidebarContrast ?? false,
      // Named here because this mapper lists its fields: left out, the form would never have a
      // version to send back, and every save would skip the check silently.
      version: dto.version,
    };
  }
}

export const hrisApiCompanyAppearanceClient = new HrisApiCompanyAppearanceClient();
