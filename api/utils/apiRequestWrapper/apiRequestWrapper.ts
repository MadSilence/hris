import { NextRequest } from "next/server";
import { withMiddleware } from "@/api/middleware";
import { withAuthMiddleware } from "@/api/middleware/authMiddleware";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";
import { withPrivilegeMiddleware } from "@/api/middleware/privilegeMiddleware";

export type NextRequestHandler<T> = (request: NextRequest, params: T) => Promise<Response> | Response;

export const apiRequestWrapper = <T>(handler: NextRequestHandler<T>) => {
  const middlewares = [withPrivilegeMiddleware, withAuthMiddleware, withErrorMiddleware];
  return withMiddleware<T>(middlewares, handler);
}
