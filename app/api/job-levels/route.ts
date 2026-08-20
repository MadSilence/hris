import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { jobLevelsRoutes } from "@/api/modules/jobLevels/routes/jobLevelsRoutes";

export const GET = apiRequestWrapper(async () => jobLevelsRoutes.listJobLevels());
