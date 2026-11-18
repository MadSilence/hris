"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiSigningService } from "@/api/modules/signing/services";
import type { EnvelopeDTO, SendForSignatureRequest } from "@/api/modules/signing/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/**
 * The sender's mutations (documents-send-for-signature S02–S09): send, remind whoever's turn it is, cancel with an
 * optional comment. Who may do them is Java's answer — *send for signature* on the person's documents.
 */

export async function sendForSignatureAction(body: SendForSignatureRequest): Promise<ActionResult<EnvelopeDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiSigningService.send(body) };
  } catch (error) {
    return toActionError(error, "sendForSignatureAction");
  }
}

export async function remindSigningAction(envelopeId: string): Promise<ActionResult<EnvelopeDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiSigningService.remind(envelopeId) };
  } catch (error) {
    return toActionError(error, "remindSigningAction");
  }
}

export async function cancelSigningAction(envelopeId: string, reason: string | null): Promise<ActionResult<EnvelopeDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiSigningService.cancel(envelopeId, reason) };
  } catch (error) {
    return toActionError(error, "cancelSigningAction");
  }
}
