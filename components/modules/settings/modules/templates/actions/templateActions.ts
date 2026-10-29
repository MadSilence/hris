"use server";

// Every export is an explicit `async function` — a `const` does not survive as a server action.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiTemplatesService } from "@/api/modules/templates/services";
import type { TemplateApplyResponse, TemplateChoicesRequest } from "@/api/modules/templates/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/** Applies a template with the choices made in its preview; refused with TPL00002 if the company moved since. */
export async function applyTemplateAction(
  key: string,
  choices: TemplateChoicesRequest,
): Promise<ActionResult<TemplateApplyResponse>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiTemplatesService.apply(key, choices) };
  } catch (error) {
    return toActionError(error, "applyTemplateAction");
  }
}
