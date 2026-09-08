import { NextRequestHandler } from "@/api/utils/apiRequestWrapper";
import { NextRequest, NextResponse } from "next/server";
import { UnauthorizedError as JwtUnauthorizedError } from "@/api/modules/auth/services/jwtService";
import { HttpStatusCode } from "@/api/models/http";
import {
  ApiError,
  BackendUnavailableError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from "@/components/clients/exceptions";

/**
 * What a route handler answers when it fails.
 *
 * `code` is what the frontend dictionary looks up — it, not `message`, is the user-facing key.
 * `message` stays the backend's technical English, kept for logs and diagnosis. Both `fieldErrors`
 * and `requestId` used to be dropped here: the type had only three fields, so anything richer the
 * backend sent could not survive the trip even though it arrived intact.
 */
export type ErrorResponse = {
  status: HttpStatusCode;
  error?: string;
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** The values the backend interpolated into its own message, so the dictionary can use them. */
  params?: string[];
  requestId?: string;
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
  code: e instanceof ApiError ? e.code : undefined,
  message: e instanceof Error ? e.message : "",
  fieldErrors: e instanceof ApiError ? e.fieldErrors : undefined,
  params: e instanceof ApiError ? e.params : undefined,
  requestId: e instanceof ApiError ? e.requestId : undefined,
});

const getStatusCode = (e: unknown): HttpStatusCode => {
  if (e instanceof JwtUnauthorizedError || e instanceof UnauthorizedError) return HttpStatusCode.UNAUTHORIZED;
  if (e instanceof ForbiddenError) return HttpStatusCode.FORBIDDEN;
  if (e instanceof NotFoundError) return HttpStatusCode.NOT_FOUND;
  if (e instanceof ConflictError) return HttpStatusCode.CONFLICT;
  if (e instanceof ValidationError) return HttpStatusCode.UNPROCESSABLE_ENTITY;
  if (e instanceof BadRequestError) return HttpStatusCode.BAD_REQUEST;
  if (e instanceof BackendUnavailableError) return HttpStatusCode.SERVICE_UNAVAILABLE;
  return HttpStatusCode.INTERNAL_SERVER_ERROR;
}
