"use server";

// Every export is an explicit `async function`: Next refuses anything else in a "use server" file.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiReviewsService } from "@/api/modules/reviews/services";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";
import type { ReviewForm, ReviewFormWrite } from "@/models/reviews";

async function run<T>(context: string, body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await body() };
  } catch (error) {
    return toActionError(error, context);
  }
}

export async function saveReviewFormAction(input: { id: string | null; body: ReviewFormWrite }): Promise<ActionResult<ReviewForm>> {
  return run("saveReviewFormAction", () => hrisApiReviewsService.saveForm(input.id, input.body));
}
export async function duplicateReviewFormAction(id: string): Promise<ActionResult<ReviewForm>> {
  return run("duplicateReviewFormAction", () => hrisApiReviewsService.duplicateForm(id));
}
export async function archiveReviewFormAction(id: string): Promise<ActionResult<void>> {
  return run("archiveReviewFormAction", () => hrisApiReviewsService.archiveForm(id));
}
export async function unarchiveReviewFormAction(id: string): Promise<ActionResult<void>> {
  return run("unarchiveReviewFormAction", () => hrisApiReviewsService.unarchiveForm(id));
}
export async function deleteReviewFormAction(id: string): Promise<ActionResult<void>> {
  return run("deleteReviewFormAction", () => hrisApiReviewsService.deleteForm(id));
}
