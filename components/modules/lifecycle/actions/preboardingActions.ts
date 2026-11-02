"use server";

// Every export is an explicit `async function`. Next refuses anything else in a "use server" file —
// `export const x = withActionError(...)` compiles under tsc and fails at request time with "Server
// Actions must be async functions" — so the body calls `run`, which is the same middle.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiLifecycleService } from "@/api/modules/lifecycle/services";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";
import type { PreboardingPage, TaskComment } from "@/models/lifecycle";

async function run<T>(context: string, body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await body() };
  } catch (error) {
    return toActionError(error, context);
  }
}

/*
 * The preboarding page's actions. Nobody is signed in: the token is the credential, the backend
 * re-resolves it on every call, and nothing here adds a check of its own.
 */
export async function preboardingCompleteAction(input: { token: string; taskId: string }): Promise<ActionResult<PreboardingPage>> {
  return run("preboardingCompleteAction", () => hrisApiLifecycleService.preboardingComplete(input.token, input.taskId));
}

export async function preboardingFieldsAction(
  input: { token: string; taskId: string; values: Record<string, unknown> },
): Promise<ActionResult<PreboardingPage>> {
  return run("preboardingFieldsAction", () =>
    hrisApiLifecycleService.preboardingFields(input.token, input.taskId, input.values));
}

export async function preboardingDocumentAction(form: FormData): Promise<ActionResult<PreboardingPage>> {
  return run("preboardingDocumentAction", async () => {
    const token = String(form.get("token") ?? "");
    const taskId = String(form.get("taskId") ?? "");
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("No file was attached.");
    return hrisApiLifecycleService.preboardingDocument(token, taskId, file);
  });
}

export async function preboardingAnswerAction(
  input: { token: string; taskId: string; answers: Record<string, unknown> },
): Promise<ActionResult<PreboardingPage>> {
  return run("preboardingAnswerAction", () =>
    hrisApiLifecycleService.preboardingAnswer(input.token, input.taskId, input.answers));
}

/**
 * The comments of one of the joiner's tasks. A read, but an action: the page has no session, so there is no
 * route handler to go through, and the token must travel in a body.
 */
export async function preboardingCommentsAction(input: { token: string; taskId: string }): Promise<ActionResult<TaskComment[]>> {
  return run("preboardingCommentsAction", () => hrisApiLifecycleService.preboardingComments(input.token, input.taskId));
}

export async function preboardingCommentAction(
  input: { token: string; taskId: string; body: string },
): Promise<ActionResult<TaskComment[]>> {
  return run("preboardingCommentAction", () =>
    hrisApiLifecycleService.preboardingComment(input.token, input.taskId, input.body));
}
