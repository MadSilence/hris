export class ServerError extends Error {}

export class NotFoundError extends Error {}

export class BadRequestError extends Error {}

export class UnauthorizedError extends Error {}

export class ForbiddenError extends Error {}

/**
 * The backend could not be reached at all — the request never became an HTTP exchange. Distinct
 * from ServerError on purpose: "the API is down" and "the API failed" are diagnosed in different
 * places, and only the second one leaves a trace in the backend logs.
 */
export class BackendUnavailableError extends Error {}
