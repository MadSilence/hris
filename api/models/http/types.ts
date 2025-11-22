export type RequestMethod = "GET" | "POST" | "PUT";

export enum HttpStatusCode {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}