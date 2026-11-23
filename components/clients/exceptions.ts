/**
 * Everything the backend can tell us about a refusal, carried in one shape.
 *
 * `code` is the key the user-facing dictionary looks up — the `message` is the backend's technical
 * English, written for a developer and a log, and is never rendered as-is. `requestId` is the
 * `X-Request-Id` the API echoes on every response; it is what someone quotes to support.
 */
export type ApiErrorInit = ErrorOptions & {
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string>;
  requestId?: string;
  /**
   * The values the backend interpolated into its own message, sent separately.
   *
   * Forty-six codes carry data in their text ("Unknown attribute: {0}"), and while the parameters
   * were only available inside the formatted sentence the dictionary could not own those messages —
   * a fixed entry would have dropped the part that says *which* attribute. With these, the entry can
   * carry the placeholders and we write the wording.
   */
  params?: string[];
  /** The login's wrong-password refusal from the third in a row for the address: offer the reset link (U2). */
  offerPasswordReset?: boolean;
};

/** Base for every failure that came back from an API — ours or the backend's. */
export class ApiError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly fieldErrors?: Record<string, string>;
  public readonly requestId?: string;
  public readonly params?: string[];
  public readonly offerPasswordReset?: boolean;

  public constructor(message?: string, init: ApiErrorInit = {}) {
    super(message, init);
    this.name = new.target.name;
    this.status = init.status;
    this.code = init.code;
    this.fieldErrors = init.fieldErrors;
    this.requestId = init.requestId;
    this.params = init.params;
    this.offerPasswordReset = init.offerPasswordReset;
  }
}

/** 500 and friends, or a response we could not parse. */
export class ServerError extends ApiError {}

export class NotFoundError extends ApiError {}

/**
 * A 400 from the API: the request itself could not be read. Domain refusals no longer land here —
 * they answer 409 or 422 since the error classes were introduced.
 */
export class BadRequestError extends ApiError {}

/**
 * 409 — the request was fine, the current state refuses it: already archived, in use, not empty.
 * The user cannot fix this by editing a field, so it belongs in a card, not under an input.
 */
export class ConflictError extends ApiError {}

/**
 * 422 — the input is wrong and the user can fix it. `fieldErrors` says which field when the backend
 * knows; the form stays open either way.
 */
export class ValidationError extends ApiError {}

export class UnauthorizedError extends ApiError {}

export class ForbiddenError extends ApiError {}

/**
 * 402 — the company has not bought this, or its trial has ended (DEMO_PLAN.md 3.4). Not a ForbiddenError on purpose:
 * that one sends the reader to ask for a permission, and only the company's owner can fix this, by going live. It
 * never dispatches `hris:forbidden`; the card says what happened, by its code.
 */
export class NotEntitledError extends ApiError {}

/** Code for a failure that never reached the backend, so the backend has no code for it. */
export const BACKEND_UNAVAILABLE_CODE = "E00503";

/**
 * The backend could not be reached at all — the request never became an HTTP exchange. Distinct
 * from ServerError on purpose: "the API is down" and "the API failed" are diagnosed in different
 * places, and only the second one leaves a trace in the backend logs. It carries no `requestId` for
 * the same reason: nothing on the other side ever issued one.
 */
export class BackendUnavailableError extends ApiError {
  public constructor(message?: string, init: ApiErrorInit = {}) {
    super(message, { code: BACKEND_UNAVAILABLE_CODE, ...init });
  }
}
