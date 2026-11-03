import { hrisApiReviewsClient } from "@/api/modules/reviews/clients/hrisApiReviewsClient";
import type { AnswerInput, CycleWrite, KindWrite, ReviewFormWrite, ReviewPotential, SegmentDTO } from "@/models/reviews";

/** The seam for performance reviews: every transport — route handler, action, RSC — calls this. */
export class HrisApiReviewsService {
  listForms = () => hrisApiReviewsClient.listForms();
  getForm = (id: string) => hrisApiReviewsClient.getForm(id);
  saveForm = (id: string | null, body: ReviewFormWrite) =>
    id ? hrisApiReviewsClient.updateForm(id, body) : hrisApiReviewsClient.createForm(body);
  duplicateForm = (id: string) => hrisApiReviewsClient.duplicateForm(id);
  archiveForm = (id: string) => hrisApiReviewsClient.archiveForm(id);
  unarchiveForm = (id: string) => hrisApiReviewsClient.unarchiveForm(id);
  deleteForm = (id: string) => hrisApiReviewsClient.deleteForm(id);

  listCycles = () => hrisApiReviewsClient.listCycles();
  getCycle = (id: string) => hrisApiReviewsClient.getCycle(id);
  listTemplates = () => hrisApiReviewsClient.listTemplates();
  startFromTemplate = (templateId: string) => hrisApiReviewsClient.startFromTemplate(templateId);
  duplicateCycle = (id: string, shiftMonths: number | null) => hrisApiReviewsClient.duplicateCycle(id, shiftMonths);
  saveAsTemplate = (id: string) => hrisApiReviewsClient.saveAsTemplate(id);
  saveCycle = (id: string | null, body: CycleWrite) =>
    id ? hrisApiReviewsClient.updateCycle(id, body) : hrisApiReviewsClient.createCycle(body);
  deleteCycle = (id: string) => hrisApiReviewsClient.deleteCycle(id);
  launchPreview = (id: string) => hrisApiReviewsClient.launchPreview(id);
  launchCycle = (id: string) => hrisApiReviewsClient.launchCycle(id);
  closeCycle = (id: string) => hrisApiReviewsClient.closeCycle(id);
  updateDates = (id: string, kinds: KindWrite[], releaseDate: string | null) =>
    hrisApiReviewsClient.updateDates(id, kinds, releaseDate);
  overview = (id: string) => hrisApiReviewsClient.overview(id);
  addPeers = (participantId: string, reviewerUserIds: string[]) => hrisApiReviewsClient.addPeers(participantId, reviewerUserIds);
  removeParticipant = (participantId: string) => hrisApiReviewsClient.removeParticipant(participantId);
  withdraw = (assignmentId: string) => hrisApiReviewsClient.withdraw(assignmentId);
  reassign = (assignmentId: string, reviewerUserId: string) => hrisApiReviewsClient.reassign(assignmentId, reviewerUserId);
  nudge = (assignmentIds: string[]) => hrisApiReviewsClient.nudge(assignmentIds);

  mine = () => hrisApiReviewsClient.mine();
  assignment = (id: string) => hrisApiReviewsClient.assignment(id);
  assignmentByTask = (taskId: string) => hrisApiReviewsClient.assignmentByTask(taskId);
  saveDraft = (id: string, answers: AnswerInput[]) => hrisApiReviewsClient.saveDraft(id, answers);
  submit = (id: string, answers: AnswerInput[]) => hrisApiReviewsClient.submit(id, answers);
  decline = (id: string, reason: string | null) => hrisApiReviewsClient.decline(id, reason);
  packet = (participantId: string) => hrisApiReviewsClient.packet(participantId);
  share = (participantId: string) => hrisApiReviewsClient.share(participantId);
  acknowledge = (participantId: string, comment: string | null) => hrisApiReviewsClient.acknowledge(participantId, comment);
  forPerson = (userId: string) => hrisApiReviewsClient.forPerson(userId);

  nomination = (participantId: string) => hrisApiReviewsClient.nomination(participantId);
  colleagues = (participantId: string, q: string | null) => hrisApiReviewsClient.colleagues(participantId, q);
  nominate = (participantId: string, reviewerUserIds: string[]) => hrisApiReviewsClient.nominate(participantId, reviewerUserIds);
  approvePeers = (participantId: string, reviewerUserIds: string[]) => hrisApiReviewsClient.approvePeers(participantId, reviewerUserIds);
  approveReview = (participantId: string) => hrisApiReviewsClient.approveReview(participantId);
  sendBackReview = (participantId: string, comment: string) => hrisApiReviewsClient.sendBackReview(participantId, comment);
  stepByTask = (taskId: string) => hrisApiReviewsClient.stepByTask(taskId);

  calibrations = (cycleId: string) => hrisApiReviewsClient.calibrations(cycleId);
  createCalibration = (cycleId: string, name: string, segment: SegmentDTO) =>
    hrisApiReviewsClient.createCalibration(cycleId, name, segment);
  calibration = (id: string) => hrisApiReviewsClient.calibration(id);
  closeCalibration = (id: string) => hrisApiReviewsClient.closeCalibration(id);
  calibrateRating = (id: string, participantId: string, rating: number, reason: string) =>
    hrisApiReviewsClient.calibrateRating(id, participantId, rating, reason);
  setPotential = (id: string, participantId: string, potential: ReviewPotential | null) =>
    hrisApiReviewsClient.setPotential(id, participantId, potential);
  results = (cycleId: string) => hrisApiReviewsClient.results(cycleId);
  exportResults = (cycleId: string, format: "csv" | "xlsx") => hrisApiReviewsClient.exportResults(cycleId, format);
}

export const hrisApiReviewsService = new HrisApiReviewsService();
