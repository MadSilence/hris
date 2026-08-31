import { ActionStatus } from "@/components/models/ActionStatus";
import { ApiError, BackendUnavailableError } from "@/components/clients/exceptions";
import { FALLBACK_ERROR_MESSAGE, messageForCode } from "@/lib/errors/errorMessages";

/**
 * What every server action answers with.
 *
 * `status`, `data` and `errorMessage` are the shape callers have always read, kept byte-compatible
 * on purpose — the ~111 places that check `res.status === ActionStatus.SUCCESS` did not have to
 * change when this was introduced. The rest is new and optional: `code` for anything that wants to
 * branch on the reason, `fieldErrors` to put the message next to the field it belongs to, and
 * `requestId` so an unexpected failure is quotable to support.
 */
export type ActionResult<T = unknown> = {
  status: ActionStatus;
  data?: T;
  errorMessage?: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  requestId?: string;
};

/** Turns a caught error into the answer a caller reads. Exported for actions that cannot be wrapped. */
export const toActionError = (error: unknown, context?: string): ActionResult<never> => {
  if (error instanceof ApiError) {
    // The log line is the technical half — the backend's own wording plus the request id, which is
    // the same id printed on the backend side through %X{traceId}. The user gets the dictionary.
    console.error(
      `${context ?? "action"} failed:`,
      error.code ?? error.name,
      error.message,
      error.requestId ? `requestId=${error.requestId}` : "",
    );

    return {
      status: ActionStatus.ERROR,
      errorMessage: messageForCode(error.code, error.message),
      code: error.code,
      fieldErrors: error.fieldErrors,
      // Only worth showing for a failure nobody expected; a refused business rule has nothing to
      // look up. BackendUnavailableError never has one — nothing on the far side issued it.
      requestId: error instanceof BackendUnavailableError ? undefined : error.requestId,
    };
  }

  // Not an ApiError at all: a bug in our own code, a bad JSON parse, a thrown string. There is no
  // code to look up and nothing useful to tell the user beyond the generic sentence.
  console.error(`${context ?? "action"} failed with a non-API error:`, error);
  return { status: ActionStatus.ERROR, errorMessage: FALLBACK_ERROR_MESSAGE };
};

/**
 * The middle for mutations — the mirror of `withErrorMiddleware`, which only ever covered reads.
 *
 * Server actions run on the server and cannot reach a toast or a boundary, so before this existed
 * each of them caught its own error and wrote its own sentence. That is why 91 of 113 replaced the
 * backend's reason with "An error occurred": not negligence, but the absence of anywhere else to
 * put the decision.
 *
 * Wrap the body; do not catch inside it. Anything that throws — the service, a revalidate, a mapper
 * — lands here and comes back in one shape.
 */
export const withActionError =
  <A extends unknown[], R>(run: (...args: A) => Promise<R>, context?: string) =>
    async (...args: A): Promise<ActionResult<R>> => {
      try {
        const data = await run(...args);
        return { status: ActionStatus.SUCCESS, data };
      } catch (error) {
        return toActionError(error, context);
      }
    };
