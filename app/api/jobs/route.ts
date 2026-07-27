import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { jobsRoutes } from "@/api/modules/jobs/routes/jobsRoutes";

export const GET = apiRequestWrapper(async () => jobsRoutes.listJobs());
