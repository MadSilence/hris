import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  AnswerInput,
  CalibrationRow,
  CalibrationSession,
  CalibrationSummary,
  CycleResults,
  ReviewPotential,
  SegmentDTO,
  AssignmentRow,
  Colleague,
  Cycle,
  CycleOverview,
  CycleSummary,
  CycleWrite,
  KindWrite,
  LaunchPreview,
  MyReviews,
  Nomination,
  Packet,
  PacketSummary,
  PeersResult,
  ReviewForm,
  ReviewStepKind,
  ReviewFormSummary,
  ReviewFormWrite,
  Writing,
} from "@/models/reviews";

const body = (value: unknown) => value as Record<string, unknown>;

/** Backend URLs for performance reviews. No logic. */
export class HrisApiReviewsClient {
  // forms
  listForms() {
    return hrisApiClient.get<ReviewFormSummary[]>("/reviews/forms");
  }
  getForm(id: string) {
    return hrisApiClient.get<ReviewForm>(`/reviews/forms/${id}`);
  }
  createForm(write: ReviewFormWrite) {
    return hrisApiClient.post<ReviewForm>("/reviews/forms", body(write));
  }
  updateForm(id: string, write: ReviewFormWrite) {
    return hrisApiClient.put<ReviewForm>(`/reviews/forms/${id}`, body(write));
  }
  duplicateForm(id: string) {
    return hrisApiClient.post<ReviewForm>(`/reviews/forms/${id}/duplicate`);
  }
  archiveForm(id: string) {
    return hrisApiClient.post<void>(`/reviews/forms/${id}/archive`);
  }
  unarchiveForm(id: string) {
    return hrisApiClient.post<void>(`/reviews/forms/${id}/unarchive`);
  }
  deleteForm(id: string) {
    return hrisApiClient.post<void>(`/reviews/forms/${id}/delete`);
  }

  // cycles
  listCycles() {
    return hrisApiClient.get<CycleSummary[]>("/reviews/cycles");
  }
  getCycle(id: string) {
    return hrisApiClient.get<Cycle>(`/reviews/cycles/${id}`);
  }
  listTemplates() {
    return hrisApiClient.get<CycleSummary[]>("/reviews/cycles/templates");
  }
  startFromTemplate(templateId: string) {
    return hrisApiClient.post<Cycle>(`/reviews/cycles/templates/${templateId}/start`);
  }
  duplicateCycle(id: string, shiftMonths: number | null) {
    return hrisApiClient.post<Cycle>(`/reviews/cycles/${id}/duplicate`, body({ shiftMonths }));
  }
  saveAsTemplate(id: string) {
    return hrisApiClient.post<Cycle>(`/reviews/cycles/${id}/save-as-template`);
  }
  createCycle(write: CycleWrite) {
    return hrisApiClient.post<Cycle>("/reviews/cycles", body(write));
  }
  updateCycle(id: string, write: CycleWrite) {
    return hrisApiClient.put<Cycle>(`/reviews/cycles/${id}`, body(write));
  }
  deleteCycle(id: string) {
    return hrisApiClient.post<void>(`/reviews/cycles/${id}/delete`);
  }
  launchPreview(id: string) {
    return hrisApiClient.get<LaunchPreview>(`/reviews/cycles/${id}/launch-preview`);
  }
  launchCycle(id: string) {
    return hrisApiClient.post<Cycle>(`/reviews/cycles/${id}/launch`);
  }
  closeCycle(id: string) {
    return hrisApiClient.post<Cycle>(`/reviews/cycles/${id}/close`);
  }
  updateDates(id: string, kinds: KindWrite[], releaseDate: string | null) {
    return hrisApiClient.put<Cycle>(`/reviews/cycles/${id}/dates`, body({ kinds, releaseDate }));
  }
  overview(id: string) {
    return hrisApiClient.get<CycleOverview>(`/reviews/cycles/${id}/overview`);
  }
  addPeers(participantId: string, reviewerUserIds: string[]) {
    return hrisApiClient.post<PeersResult>(`/reviews/cycles/participants/${participantId}/peers`, body({ reviewerUserIds }));
  }
  removeParticipant(participantId: string) {
    return hrisApiClient.post<void>(`/reviews/cycles/participants/${participantId}/remove`);
  }
  withdraw(assignmentId: string) {
    return hrisApiClient.post<void>(`/reviews/cycles/assignments/${assignmentId}/withdraw`);
  }
  reassign(assignmentId: string, reviewerUserId: string) {
    return hrisApiClient.post<AssignmentRow>(`/reviews/cycles/assignments/${assignmentId}/reassign`, body({ reviewerUserId }));
  }
  nudge(assignmentIds: string[]) {
    return hrisApiClient.post<void>("/reviews/cycles/assignments/nudge", body({ assignmentIds }));
  }

  // taking part
  mine() {
    return hrisApiClient.get<MyReviews>("/reviews/me");
  }
  assignment(id: string) {
    return hrisApiClient.get<Writing>(`/reviews/assignments/${id}`);
  }
  assignmentByTask(taskId: string) {
    return hrisApiClient.get<{ assignmentId: string }>(`/reviews/assignments/by-task/${taskId}`);
  }
  saveDraft(id: string, answers: AnswerInput[]) {
    return hrisApiClient.put<Writing>(`/reviews/assignments/${id}/draft`, body({ answers }));
  }
  submit(id: string, answers: AnswerInput[]) {
    return hrisApiClient.post<Writing>(`/reviews/assignments/${id}/submit`, body({ answers }));
  }
  decline(id: string, reason: string | null) {
    return hrisApiClient.post<void>(`/reviews/assignments/${id}/decline`, body({ reason }));
  }
  packet(participantId: string) {
    return hrisApiClient.get<Packet>(`/reviews/packets/${participantId}`);
  }
  share(participantId: string) {
    // Empty for somebody who shared on the manager's behalf and may not read what was written (A5).
    return hrisApiClient.post<Packet | null>(`/reviews/packets/${participantId}/share`);
  }
  acknowledge(participantId: string, comment: string | null) {
    return hrisApiClient.post<Packet>(`/reviews/packets/${participantId}/acknowledge`, body({ comment }));
  }
  forPerson(userId: string) {
    return hrisApiClient.get<PacketSummary[]>(`/reviews/people/${userId}`);
  }

  // steps: nominating and approving peers, approving a manager review
  nomination(participantId: string) {
    return hrisApiClient.get<Nomination>(`/reviews/nominations/${participantId}`);
  }
  colleagues(participantId: string, q: string | null) {
    const query = q ? `?q=${encodeURIComponent(q)}` : "";
    return hrisApiClient.get<Colleague[]>(`/reviews/nominations/${participantId}/colleagues${query}`);
  }
  nominate(participantId: string, reviewerUserIds: string[]) {
    return hrisApiClient.post<Nomination>(`/reviews/nominations/${participantId}`, body({ reviewerUserIds }));
  }
  approvePeers(participantId: string, reviewerUserIds: string[]) {
    return hrisApiClient.post<Nomination>(`/reviews/nominations/${participantId}/approve`, body({ reviewerUserIds }));
  }
  approveReview(participantId: string) {
    return hrisApiClient.post<void>(`/reviews/packets/${participantId}/approve`);
  }
  sendBackReview(participantId: string, comment: string) {
    return hrisApiClient.post<void>(`/reviews/packets/${participantId}/send-back`, body({ comment }));
  }
  stepByTask(taskId: string) {
    return hrisApiClient.get<{ kind: ReviewStepKind; participantId: string }>(`/reviews/steps/by-task/${taskId}`);
  }

  // calibration and results (REVIEWS_PLAN.md 12.1–12.4)
  calibrations(cycleId: string) {
    return hrisApiClient.get<CalibrationSummary[]>(`/reviews/cycles/${cycleId}/calibrations`);
  }
  createCalibration(cycleId: string, name: string, segment: SegmentDTO) {
    return hrisApiClient.post<CalibrationSession>(`/reviews/cycles/${cycleId}/calibrations`, body({ name, segment }));
  }
  calibration(id: string) {
    return hrisApiClient.get<CalibrationSession>(`/reviews/calibrations/${id}`);
  }
  closeCalibration(id: string) {
    return hrisApiClient.post<CalibrationSession>(`/reviews/calibrations/${id}/close`);
  }
  calibrateRating(id: string, participantId: string, rating: number, reason: string) {
    return hrisApiClient.post<CalibrationRow>(`/reviews/calibrations/${id}/participants/${participantId}/rating`,
      body({ rating, reason }));
  }
  setPotential(id: string, participantId: string, potential: ReviewPotential | null) {
    return hrisApiClient.post<CalibrationRow>(`/reviews/calibrations/${id}/participants/${participantId}/potential`,
      body({ potential }));
  }
  results(cycleId: string) {
    return hrisApiClient.get<CycleResults>(`/reviews/cycles/${cycleId}/results`);
  }
  exportResults(cycleId: string, format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiClient.fetch(`/reviews/cycles/${cycleId}/results/export?format=${format}`);
  }
}

export const hrisApiReviewsClient = new HrisApiReviewsClient();
