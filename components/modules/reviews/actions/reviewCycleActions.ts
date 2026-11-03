"use server";

// Every export is an explicit `async function`: Next refuses anything else in a "use server" file.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiReviewsService } from "@/api/modules/reviews/services";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";
import type {
  AnswerInput,
  AssignmentRow,
  CalibrationRow,
  CalibrationSession,
  ReviewPotential,
  SegmentDTO,
  Cycle,
  CycleWrite,
  KindWrite,
  Nomination,
  Packet,
  PeersResult,
  Writing,
} from "@/models/reviews";

async function run<T>(context: string, body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await body() };
  } catch (error) {
    return toActionError(error, context);
  }
}

// Cycles
export async function saveCycleAction(input: { id: string | null; body: CycleWrite }): Promise<ActionResult<Cycle>> {
  return run("saveCycleAction", () => hrisApiReviewsService.saveCycle(input.id, input.body));
}
/** "Duplicate" (dates cleared, {@code shiftMonths} null) and "Repeat" (every date moved), REVIEWS_PLAN.md 11.1. */
export async function duplicateCycleAction(input: { id: string; shiftMonths: number | null }): Promise<ActionResult<Cycle>> {
  return run("duplicateCycleAction", () => hrisApiReviewsService.duplicateCycle(input.id, input.shiftMonths));
}
export async function saveCycleAsTemplateAction(id: string): Promise<ActionResult<Cycle>> {
  return run("saveCycleAsTemplateAction", () => hrisApiReviewsService.saveAsTemplate(id));
}
export async function startCycleFromTemplateAction(templateId: string): Promise<ActionResult<Cycle>> {
  return run("startCycleFromTemplateAction", () => hrisApiReviewsService.startFromTemplate(templateId));
}
export async function deleteCycleAction(id: string): Promise<ActionResult<void>> {
  return run("deleteCycleAction", () => hrisApiReviewsService.deleteCycle(id));
}
export async function launchCycleAction(id: string): Promise<ActionResult<Cycle>> {
  return run("launchCycleAction", () => hrisApiReviewsService.launchCycle(id));
}
export async function closeCycleAction(id: string): Promise<ActionResult<Cycle>> {
  return run("closeCycleAction", () => hrisApiReviewsService.closeCycle(id));
}
export async function updateCycleDatesAction(input: { id: string; kinds: KindWrite[]; releaseDate: string | null }): Promise<ActionResult<Cycle>> {
  return run("updateCycleDatesAction", () => hrisApiReviewsService.updateDates(input.id, input.kinds, input.releaseDate));
}

// Running a cycle
export async function addPeersAction(input: { participantId: string; reviewerUserIds: string[] }): Promise<ActionResult<PeersResult>> {
  return run("addPeersAction", () => hrisApiReviewsService.addPeers(input.participantId, input.reviewerUserIds));
}
export async function removeParticipantAction(participantId: string): Promise<ActionResult<void>> {
  return run("removeParticipantAction", () => hrisApiReviewsService.removeParticipant(participantId));
}
export async function withdrawReviewAction(assignmentId: string): Promise<ActionResult<void>> {
  return run("withdrawReviewAction", () => hrisApiReviewsService.withdraw(assignmentId));
}
export async function reassignReviewAction(input: { assignmentId: string; reviewerUserId: string }): Promise<ActionResult<AssignmentRow>> {
  return run("reassignReviewAction", () => hrisApiReviewsService.reassign(input.assignmentId, input.reviewerUserId));
}
export async function nudgeReviewsAction(assignmentIds: string[]): Promise<ActionResult<void>> {
  return run("nudgeReviewsAction", () => hrisApiReviewsService.nudge(assignmentIds));
}

// Taking part
export async function saveReviewDraftAction(input: { id: string; answers: AnswerInput[] }): Promise<ActionResult<Writing>> {
  return run("saveReviewDraftAction", () => hrisApiReviewsService.saveDraft(input.id, input.answers));
}
export async function submitReviewAction(input: { id: string; answers: AnswerInput[] }): Promise<ActionResult<Writing>> {
  return run("submitReviewAction", () => hrisApiReviewsService.submit(input.id, input.answers));
}
export async function declineReviewAction(input: { id: string; reason: string | null }): Promise<ActionResult<void>> {
  return run("declineReviewAction", () => hrisApiReviewsService.decline(input.id, input.reason));
}
export async function shareReviewAction(participantId: string): Promise<ActionResult<Packet | null>> {
  return run("shareReviewAction", () => hrisApiReviewsService.share(participantId));
}
// Steps (REVIEWS_PLAN.md 10.2–10.3)
export async function nominatePeersAction(input: { participantId: string; reviewerUserIds: string[] }): Promise<ActionResult<Nomination>> {
  return run("nominatePeersAction", () => hrisApiReviewsService.nominate(input.participantId, input.reviewerUserIds));
}
export async function approvePeersAction(input: { participantId: string; reviewerUserIds: string[] }): Promise<ActionResult<Nomination>> {
  return run("approvePeersAction", () => hrisApiReviewsService.approvePeers(input.participantId, input.reviewerUserIds));
}
export async function approveReviewAction(participantId: string): Promise<ActionResult<void>> {
  return run("approveReviewAction", () => hrisApiReviewsService.approveReview(participantId));
}
export async function sendBackReviewAction(input: { participantId: string; comment: string }): Promise<ActionResult<void>> {
  return run("sendBackReviewAction", () => hrisApiReviewsService.sendBackReview(input.participantId, input.comment));
}

export async function acknowledgeReviewAction(input: { participantId: string; comment: string | null }): Promise<ActionResult<Packet>> {
  return run("acknowledgeReviewAction", () => hrisApiReviewsService.acknowledge(input.participantId, input.comment));
}

// Calibration (REVIEWS_PLAN.md 12.1–12.2)
export async function createCalibrationAction(input: { cycleId: string; name: string; segment: SegmentDTO }): Promise<ActionResult<CalibrationSession>> {
  return run("createCalibrationAction", () => hrisApiReviewsService.createCalibration(input.cycleId, input.name, input.segment));
}
export async function closeCalibrationAction(id: string): Promise<ActionResult<CalibrationSession>> {
  return run("closeCalibrationAction", () => hrisApiReviewsService.closeCalibration(id));
}
export async function calibrateRatingAction(input: { id: string; participantId: string; rating: number; reason: string }): Promise<ActionResult<CalibrationRow>> {
  return run("calibrateRatingAction", () => hrisApiReviewsService.calibrateRating(input.id, input.participantId, input.rating, input.reason));
}
export async function setPotentialAction(input: { id: string; participantId: string; potential: ReviewPotential | null }): Promise<ActionResult<CalibrationRow>> {
  return run("setPotentialAction", () => hrisApiReviewsService.setPotential(input.id, input.participantId, input.potential));
}
