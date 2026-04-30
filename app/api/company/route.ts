import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { companyRoutes } from "@/api/modules/company/routes";

export const GET = apiRequestWrapper(async () => {
  return companyRoutes.getCompany();
});
