import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { roleRoutes } from "@/api/modules/roles/routes/roleRoutes";

export const GET = apiRequestWrapper(async (req: Request) => {
  return roleRoutes.exportRoles(req);
});
