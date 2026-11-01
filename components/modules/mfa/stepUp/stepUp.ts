import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";

/** The backend's "confirm it is you" (MFA_DESIGN.md § 3.5): a 403 the step-up dialog answers. */
export const STEP_UP_REQUIRED = "AUTH00009";

type Listener = (resolve: (proved: boolean) => void) => void;
let listener: Listener | null = null;

/** The one dialog registers here when it mounts (in the app shell). */
export const registerStepUpDialog = (open: Listener | null) => {
  listener = open;
};

/** Opens the dialog; true once the person proved it is them, false if they cancelled. */
export const requestStepUp = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (!listener) {
      resolve(false);
      return;
    }
    listener(resolve);
  });

/**
 * Runs a server action; if it answers "confirm it is you", asks, and runs it once more. One replay: a
 * second AUTH00009 is an answer, not a loop.
 */
export async function withStepUpAction<T>(run: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  const first = await run();
  if (first.status === ActionStatus.ERROR && first.code === STEP_UP_REQUIRED) {
    if (await requestStepUp()) return run();
  }
  return first;
}

/** The same, for a call that throws — a read path or a route handler through `InternalApiClient`. */
export async function withStepUp<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    if (code === STEP_UP_REQUIRED && (await requestStepUp())) return run();
    throw error;
  }
}
