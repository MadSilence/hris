import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { jobLevelGroupRoutes } from "@/api/modules/jobLevelGroup/routes/jobLevelGroupRoutes";

export const GET = apiRequestWrapper(async () => jobLevelGroupRoutes.getJobLevelGroups());
