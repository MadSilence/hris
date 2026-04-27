import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { impersonationRoutes } from "@/api/modules/impersonation/routes/impersonationRoutes";

export const POST = withErrorMiddleware(async (req) => {
  return impersonationRoutes.stop(req);
});
