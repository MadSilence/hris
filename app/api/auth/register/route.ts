import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { authRoutes } from "@/api/modules/auth/routes/authRoutes";
import { CreateResponse } from "@/api/models/misc";
import { RegisterRequest } from "@/api/modules/auth/dto";

export const POST = withErrorMiddleware(async (req) => {
  const payload = await req.json();
  const response = await authRoutes.register(payload);
  console.log(response);
  return Response.json(response);
});
