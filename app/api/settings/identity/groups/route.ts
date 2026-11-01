import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { identityRoutes } from "@/api/modules/identity/routes";

export const GET = apiRequestWrapper(async () => identityRoutes.groups());
