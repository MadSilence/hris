export class ServerError extends Error {}

export class NotFoundError extends Error {}

/**
 * A 400 from the API. `fieldErrors` is the backend's per-field map when it sent one — the year
 * editor saves the whole year at once, so "which row collided" is the difference between a usable
 * message and a shrug.
 */
export class BadRequestError extends Error {
  public readonly fieldErrors?: Record<string, string>;

  public constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export class UnauthorizedError extends Error {}

export class ForbiddenError extends Error {}

/**
 * The backend could not be reached at all — the request never became an HTTP exchange. Distinct
 * from ServerError on purpose: "the API is down" and "the API failed" are diagnosed in different
 * places, and only the second one leaves a trace in the backend logs.
 */
export class BackendUnavailableError extends Error {}
