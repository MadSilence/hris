import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { notificationsRoutes } from "@/api/modules/notifications/routes";

export const GET = apiRequestWrapper(async (req: Request) => {
  return notificationsRoutes.list(req);
});
