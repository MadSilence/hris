"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiSigningService } from "@/api/modules/signing/services";
import type { DocumentRequestPayload, DocumentRequestResult } from "@/api/modules/signing/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/**
 * Requests for documents (documents-requests R02–R10): ask, withdraw (the toast's Undo), and upload into one. Java
 * checks who may ask and who may upload — the request is the asked person's permission for that one file.
 */

/** Several asks at once — one per document to replace, and one for "something else"; their tasks and who was skipped. */
export async function requestDocumentsAction(payloads: DocumentRequestPayload[]): Promise<ActionResult<DocumentRequestResult>> {
  try {
    const out: DocumentRequestResult = { taskIds: [], skipped: [] };
    for (const p of payloads) {
      const r = await hrisApiSigningService.request(p);
      out.taskIds.push(...r.taskIds);
      out.skipped.push(...r.skipped);
    }
    return { status: ActionStatus.SUCCESS, data: out };
  } catch (error) {
    return toActionError(error, "requestDocumentsAction");
  }
}

export async function withdrawRequestsAction(taskIds: string[]): Promise<ActionResult<void>> {
  try {
    for (const id of taskIds) await hrisApiSigningService.withdrawRequest(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "withdrawRequestsAction");
  }
}

/** Edit expiry date (documents-expiry X04): a new date, or none. */
export async function updateDocumentExpiryAction(documentId: string, expiresOn: string | null): Promise<ActionResult<void>> {
  try {
    await hrisApiSigningService.updateDetails(documentId, expiresOn ? { expiresOn } : { clearExpiresOn: true });
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "updateDocumentExpiryAction");
  }
}

/** R08: the file, and its date when it has one — the request's folder and category are its own. */
export async function uploadForRequestAction(form: FormData): Promise<ActionResult<void>> {
  try {
    const taskId = String(form.get("taskId") ?? "");
    const file = form.get("file");
    const expiresOn = form.get("expiresOn");
    if (!(file instanceof File) || !taskId) throw new Error("A file and a request are needed");
    await hrisApiSigningService.uploadForRequest(taskId, file, typeof expiresOn === "string" && expiresOn ? expiresOn : null);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "uploadForRequestAction");
  }
}
