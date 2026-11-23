"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiSigningService } from "@/api/modules/signing/services";
import type { DrawingLink, SignatureSubmission, SigningParty } from "@/api/modules/signing/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/**
 * The signer's mutations (documents-signing G03–G06), for each of the three signers: a person in the company, a guest
 * by their link, a new joiner by their preboarding page. Java decides every one of them; nothing is checked here.
 */

/** A 6-digit code to the signer's email (G03a); bound to this browser. */
export async function sendSigningCodeAction(party: SigningParty, browserToken: string): Promise<ActionResult<void>> {
  try {
    if (party.kind === "member") await hrisApiSigningService.sendCode(party.envelopeId, browserToken);
    else if (party.kind === "guest") await hrisApiSigningService.guestCode(party.token, browserToken);
    else await hrisApiSigningService.joinerCode(party.token, party.taskId, browserToken);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "sendSigningCodeAction");
  }
}

/** G0: the code checked on its own, on the code step; a wrong one counts one of its five tries. */
export async function checkSigningCodeAction(party: SigningParty, code: string, browserToken: string): Promise<ActionResult<void>> {
  try {
    if (party.kind === "member") await hrisApiSigningService.checkCode(party.envelopeId, code, browserToken);
    else if (party.kind === "guest") await hrisApiSigningService.guestCheckCode(party.token, code, browserToken);
    else await hrisApiSigningService.joinerCheckCode(party.token, party.taskId, code, browserToken);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "checkSigningCodeAction");
  }
}

/** The signature itself (G03 → G04): the code, the name, and the drawing when it was drawn. */
/** Signs; `completed` says whether this was the last signature, so the screen can say the copy is on its way. */
export async function signAction(party: SigningParty, body: SignatureSubmission): Promise<ActionResult<{ completed: boolean }>> {
  try {
    const after =
      party.kind === "member"
        ? await hrisApiSigningService.sign(party.envelopeId, body)
        : party.kind === "guest"
          ? await hrisApiSigningService.guestSign(party.token, body)
          : await hrisApiSigningService.joinerSign(party.token, party.taskId, body);
    const status = (after as { status?: string } | null | undefined)?.status;
    return { status: ActionStatus.SUCCESS, data: { completed: status === "COMPLETED" } };
  } catch (error) {
    return toActionError(error, "signAction");
  }
}

/** Decline with a comment (G06); a joiner declines through their HR, not here. */
export async function declineSigningAction(party: SigningParty, reason: string): Promise<ActionResult<void>> {
  try {
    if (party.kind === "member") await hrisApiSigningService.decline(party.envelopeId, reason);
    else if (party.kind === "guest") await hrisApiSigningService.guestDecline(party.token, reason);
    else throw new Error("A joiner cannot decline from the preboarding page");
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "declineSigningAction");
  }
}

/** A one-time link to draw on the phone (G03d); a new one ends the last. */
export async function drawingLinkAction(party: SigningParty): Promise<ActionResult<DrawingLink>> {
  try {
    const data =
      party.kind === "member"
        ? await hrisApiSigningService.drawingLink(party.envelopeId)
        : party.kind === "guest"
          ? await hrisApiSigningService.guestDrawingLink(party.token)
          : await hrisApiSigningService.joinerDrawingLink(party.token, party.taskId);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "drawingLinkAction");
  }
}

/** The phone sends its drawing (G03h); the link is spent. */
export async function uploadPhoneDrawingAction(token: string, drawing: string): Promise<ActionResult<void>> {
  try {
    await hrisApiSigningService.drawUpload(token, drawing);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "uploadPhoneDrawingAction");
  }
}
