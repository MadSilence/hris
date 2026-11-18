import { hrisApiSigningClient } from "../clients";
import type {
  DocumentRequestPayload,
  SectionDocumentsQuery,
  SendForSignatureRequest,
  SignatureSubmission,
} from "../dto";

/**
 * The seam for signing and the Documents section: every transport — a route handler, a server action, a server
 * component — comes through here (hris/CLAUDE.md § "API Communication").
 */
export class HrisApiSigningService {
  send = (body: SendForSignatureRequest) => hrisApiSigningClient.send(body);
  forPerson = (userId: string) => hrisApiSigningClient.forPerson(userId);
  cancel = (id: string, reason: string | null) => hrisApiSigningClient.cancel(id, reason);
  remind = (id: string) => hrisApiSigningClient.remind(id);
  history = (documentId: string) => hrisApiSigningClient.history(documentId);

  toSign = () => hrisApiSigningClient.toSign();
  forSigner = (id: string) => hrisApiSigningClient.forSigner(id);
  pdf = (id: string) => hrisApiSigningClient.pdf(id);
  sendCode = (id: string, browserToken: string) => hrisApiSigningClient.sendCode(id, browserToken);
  sign = (id: string, body: SignatureSubmission) => hrisApiSigningClient.sign(id, body);
  decline = (id: string, reason: string) => hrisApiSigningClient.decline(id, reason);
  drawingLink = (id: string) => hrisApiSigningClient.drawingLink(id);
  drawing = (id: string) => hrisApiSigningClient.drawing(id);

  guestView = (token: string) => hrisApiSigningClient.guestView(token);
  guestPdf = (token: string) => hrisApiSigningClient.guestPdf(token);
  guestCopy = (token: string) => hrisApiSigningClient.guestCopy(token);
  guestCode = (token: string, browserToken: string) => hrisApiSigningClient.guestCode(token, browserToken);
  guestSign = (token: string, body: SignatureSubmission) => hrisApiSigningClient.guestSign(token, body);
  guestDecline = (token: string, reason: string) => hrisApiSigningClient.guestDecline(token, reason);
  guestDrawingLink = (token: string) => hrisApiSigningClient.guestDrawingLink(token);
  guestDrawing = (token: string) => hrisApiSigningClient.guestDrawing(token);

  joinerView = (token: string, taskId: string) => hrisApiSigningClient.joinerView(token, taskId);
  joinerPdf = (token: string, taskId: string) => hrisApiSigningClient.joinerPdf(token, taskId);
  joinerCode = (token: string, taskId: string, browserToken: string) =>
    hrisApiSigningClient.joinerCode(token, taskId, browserToken);
  joinerSign = (token: string, taskId: string, body: SignatureSubmission) =>
    hrisApiSigningClient.joinerSign(token, taskId, body);
  joinerDrawingLink = (token: string, taskId: string) => hrisApiSigningClient.joinerDrawingLink(token, taskId);
  joinerDrawing = (token: string, taskId: string) => hrisApiSigningClient.joinerDrawing(token, taskId);

  drawOpen = (token: string) => hrisApiSigningClient.drawOpen(token);
  drawUpload = (token: string, drawing: string) => hrisApiSigningClient.drawUpload(token, drawing);

  sectionDocuments = (q: SectionDocumentsQuery) => hrisApiSigningClient.sectionDocuments(q);
  sectionSignings = (q: Pick<SectionDocumentsQuery, "q" | "personIds" | "categoryIds">) =>
    hrisApiSigningClient.sectionSignings(q);
  sectionRequests = () => hrisApiSigningClient.sectionRequests();
  sectionCounts = () => hrisApiSigningClient.sectionCounts();
  expiring = () => hrisApiSigningClient.expiring();

  updateDetails = (documentId: string, body: { expiresOn?: string | null; clearExpiresOn?: boolean; description?: string | null }) =>
    hrisApiSigningClient.updateDetails(documentId, body);
  templates = () => hrisApiSigningClient.templates();
  request = (body: DocumentRequestPayload) => hrisApiSigningClient.request(body);
  uploadForRequest = (taskId: string, file: File, expiresOn: string | null) =>
    hrisApiSigningClient.uploadForRequest(taskId, file, expiresOn);
  withdrawRequest = (taskId: string) => hrisApiSigningClient.withdrawRequest(taskId);
}

export const hrisApiSigningService = new HrisApiSigningService();
