import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { legalEntityRoutes } from "@/api/modules/legalEntity/routes/legalEntityRoutes";

export const GET = apiRequestWrapper(async (req: Request) => {
  return legalEntityRoutes.exportLegalEntities(req);
});
