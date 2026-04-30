import { Company } from "@/models/company/Company";
import { CompanyDTO } from "@/api/modules/company/dto/CompanyDTO";

export const companyMapper = {
  mapCompanyDTOtoCompany(dto: CompanyDTO): Company {
    return {
      id: dto.id,
      name: dto.name,
      subdomain: dto.subdomain,
      companyLogo: this.resolveBackendAssetUrl(dto.companyLogo),
    };
  },

  resolveBackendAssetUrl(path?: string | null): string | null {
    if (!path) return null;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    const baseUrl = process.env.BACKEND_URL ?? "";

    return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  },
};
