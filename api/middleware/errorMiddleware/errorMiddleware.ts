import { NextRequestHandler } from "@/api/utils/apiRequestWrapper";
import { NextRequest, NextResponse } from "next/server";
import { UnauthorizedError } from "@/api/modules/auth/services/jwtService";
import { HttpStatusCode } from "@/api/models/http";
import { BadRequestError } from "@/api/models/errors/BadRequestError";
import { NotFoundError } from "@/api/models/errors/NotFoundError";
import { PrivilegeError } from "@/api/middleware/privilegeMiddleware";

export type ErrorResponse = {
  status: HttpStatusCode;
  error?: string;
  message?: string;
}

export const withErrorMiddleware =
  <T>(handler: NextRequestHandler<T>) =>
    async (request: NextRequest, params: T) => {
      try {
        return await handler(request, params);
      } catch (e) {
        const response = getErrorResponse(e);
        return NextResponse.json(response, { status: response.status.valueOf() });
      }
    };

const getErrorResponse = (e: unknown): ErrorResponse => ({
  status: getStatusCode(e),
  error: e instanceof Error ? e.name : "",
  message: e instanceof Error ? e.message : "",
});

const getStatusCode = (e: unknown): HttpStatusCode => {
  if (e instanceof UnauthorizedError) return HttpStatusCode.UNAUTHORIZED;
  if (e instanceof PrivilegeError) return HttpStatusCode.FORBIDDEN;
  if (e instanceof NotFoundError) return HttpStatusCode.NOT_FOUND;
  if (e instanceof BadRequestError) return HttpStatusCode.BAD_REQUEST;

  return HttpStatusCode.INTERNAL_SERVER_ERROR;
}
