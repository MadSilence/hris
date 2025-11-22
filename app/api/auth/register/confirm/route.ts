import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { authRoutes } from "@/api/modules/auth/routes/authRoutes";

export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const response = await authRoutes.completeRegister(payload);
  return Response.json(response);
});
