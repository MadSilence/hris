import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { attributesRoutes } from "@/api/modules/attributes/routes/attributesRoutes";

export const GET = apiRequestWrapper(async (req: Request) => {
  return attributesRoutes.exportAttributes(req);
});
