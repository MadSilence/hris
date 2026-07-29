import { NextRequest } from "next/server";
import { withMiddleware } from "@/api/middleware";
import { withAuthMiddleware } from "@/api/middleware/authMiddleware";
import { withErrorMiddleware } from "@/api/middleware/errorMiddleware";

export type NextRequestHandler<T> = (request: NextRequest, params: T) => Promise<Response> | Response;

export const apiRequestWrapper = <T>(handler: NextRequestHandler<T>) => {
  const middlewares = [withAuthMiddleware, withErrorMiddleware];
  return withMiddleware<T>(middlewares, handler);
}
