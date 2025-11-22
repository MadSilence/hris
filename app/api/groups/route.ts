import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { groupsRoutes } from "@/api/modules/groups/routes/groupsRoutes/groupsRoutes";

export const GET = apiRequestWrapper(async () => groupsRoutes.getGroups());
