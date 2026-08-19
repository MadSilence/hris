import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { companyAppearanceRoutes } from "@/api/modules/company/modules/appearance/routes";

export const GET = apiRequestWrapper(async () => {
  return companyAppearanceRoutes.getAppearance();
});
