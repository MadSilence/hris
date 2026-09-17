import { Company } from "@/models/company/Company";
import { CompanyDTO } from "@/api/modules/company/dto/CompanyDTO";

export const companyMapper = {
  mapCompanyDTOtoCompany(dto: CompanyDTO): Company {
    return {
      // Everything the backend sends, then only what changes on the way. Listing fields one by one
      // lost every field added later, silently — the working week once never reached the calendar.
      ...dto,
      companyLogo: this.resolveBackendAssetUrl(dto.companyLogo),
      description: dto.description ?? null,
      website: dto.website ?? null,
      // The working week rides on this payload rather than on `GET /company/settings`, which needs
      // an administration right — see `DECISIONS.md` § "The working week is not a setting, it is a
      // display primitive". This mapper lists fields explicitly, so a new one added on the backend
      // reaches nobody until it is named here; that is how the calendar was still shading Saturday
      // and Sunday after the backend had started sending the real week.
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
