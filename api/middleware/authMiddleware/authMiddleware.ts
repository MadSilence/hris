import { NextRequestHandler } from "@/api/utils/apiRequestWrapper";
import { NextRequest } from "next/server";
import { AuthErrorMessage, jwtService, UnauthorizedError } from "@/api/modules/auth/services/jwtService";

export const withAuthMiddleware =
  <T>(handler: NextRequestHandler<T>) =>
    async (request: NextRequest, params: T) => {
      try {
        await jwtService.verifyToken();
      } catch (e) {
        throw e instanceof UnauthorizedError ? e : new UnauthorizedError(AuthErrorMessage.DEFAULT, e);
      }

      return handler(request, params);
    }
