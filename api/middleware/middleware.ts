import {NextRequestHandler} from "@/api/utils/apiRequestWrapper";
import {NextRequest} from "next/server";

type Middleware<T> = (handler: NextRequestHandler<T>) => NextRequestHandler<T>;

export const withMiddleware =
    <T>(middlewares: Middleware<T>[], handler: NextRequestHandler<T>) =>
    async (request: NextRequest, params: T) => {
        let currentHandler = handler;
        middlewares.forEach((middleware) => (currentHandler = middleware(currentHandler)));
        return currentHandler(request, params);
    };