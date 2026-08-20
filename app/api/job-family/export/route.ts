import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { jobFamilyRoutes } from "@/api/modules/jobfamily/routes/jobFamilyRoutes";

export const GET = apiRequestWrapper(async (req: Request) => jobFamilyRoutes.exportJobCatalog(req));
