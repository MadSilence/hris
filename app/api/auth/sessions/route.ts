import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { sessionsRoutes } from "@/api/modules/sessions/routes";

export const GET = apiRequestWrapper(async () => sessionsRoutes.listMine());
