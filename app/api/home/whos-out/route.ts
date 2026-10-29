import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { homeRoutes } from "@/api/modules/home/routes";

export const GET = apiRequestWrapper(async (req: Request) => homeRoutes.whosOut(req));
