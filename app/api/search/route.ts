import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { searchRoutes } from "@/api/modules/search/routes";

export const GET = apiRequestWrapper(async (req: Request) => {
  return searchRoutes.search(req);
});
