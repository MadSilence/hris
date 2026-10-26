import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { delegationsRoutes } from "@/api/modules/delegations/routes";

export const GET = apiRequestWrapper(async () => delegationsRoutes.list());
