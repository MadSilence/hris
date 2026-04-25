import { NextRequestHandler } from "@/api/utils/apiRequestWrapper";
import { NextRequest, NextResponse } from "next/server";
import { UnauthorizedError as JwtUnauthorizedError } from "@/api/modules/auth/services/jwtService";
import { HttpStatusCode } from "@/api/models/http";
import { BadRequestError } from "@/api/models/errors/BadRequestError";
import { NotFoundError } from "@/api/models/errors/NotFoundError";
import { PrivilegeError } from "@/api/middleware/privilegeMiddleware";
import {
  BadRequestError as ClientBadRequestError,
  NotFoundError as ClientNotFoundError,
  UnauthorizedError as ClientUnauthorizedError,
  ForbiddenError as ClientForbiddenError,
} from "@/components/clients/exceptions";

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
  if (e instanceof JwtUnauthorizedError || e instanceof ClientUnauthorizedError) return HttpStatusCode.UNAUTHORIZED;
  if (e instanceof PrivilegeError || e instanceof ClientForbiddenError) return HttpStatusCode.FORBIDDEN;
  if (e instanceof NotFoundError || e instanceof ClientNotFoundError) return HttpStatusCode.NOT_FOUND;
  if (e instanceof BadRequestError || e instanceof ClientBadRequestError) return HttpStatusCode.BAD_REQUEST;
  return HttpStatusCode.INTERNAL_SERVER_ERROR;
}
