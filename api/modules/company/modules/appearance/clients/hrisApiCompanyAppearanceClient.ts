import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { companyMapper } from "@/api/modules/company/mappers/companyMapper";
import { CompanyAppearance } from "@/models/company/CompanyAppearance";
import {
  CompanyAppearanceDTO,
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

  /** The backend returns a backend-relative `/uploads/...` path; the browser needs an absolute URL. */
  private toModel(dto: CompanyAppearanceDTO): CompanyAppearance {
    return {
      brandColor: dto.brandColor ?? null,
      loginImageUrl: companyMapper.resolveBackendAssetUrl(dto.loginImageUrl),
      loginHeadline: dto.loginHeadline ?? null,
      loginSubheadline: dto.loginSubheadline ?? null,
    };
  }
}

export const hrisApiCompanyAppearanceClient = new HrisApiCompanyAppearanceClient();
