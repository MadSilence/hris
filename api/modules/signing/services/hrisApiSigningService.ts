import { hrisApiSigningClient } from "../clients";
import { resolveBackendAssetUrl } from "@/api/modules/users/mappers/userMapper/resolveBackendAssetUrl";
import type {
  EnvelopeDTO,
  DocumentRequestPayload,
  SectionDocumentsQuery,
  SectionFilterQuery,
  SendForSignatureRequest,
  SignatureSubmission,
} from "../dto";

/**
 * The seam for signing and the Documents section: every transport — a route handler, a server action, a server
 * component — comes through here (hris/CLAUDE.md § "API Communication").
 */
/** A signer's photo as a URL the browser can load (B5) — the backend sends its own path. */
const withPhotos = (envelope: EnvelopeDTO): EnvelopeDTO => ({
  ...envelope,
  signers: envelope.signers.map((s) => ({ ...s, avatarUrl: resolveBackendAssetUrl(s.avatarUrl) })),
});
const allWithPhotos = async (envelopes: Promise<EnvelopeDTO[]>) => (await envelopes).map(withPhotos);
const oneWithPhotos = async (envelope: Promise<EnvelopeDTO>) => withPhotos(await envelope);

export class HrisApiSigningService {
  send = (body: SendForSignatureRequest) => oneWithPhotos(hrisApiSigningClient.send(body));
  forPerson = (userId: string) => allWithPhotos(hrisApiSigningClient.forPerson(userId));
  cancel = (id: string, reason: string | null) => oneWithPhotos(hrisApiSigningClient.cancel(id, reason));
  remind = (id: string) => oneWithPhotos(hrisApiSigningClient.remind(id));
  history = (documentId: string) => hrisApiSigningClient.history(documentId);

  toSign = () => allWithPhotos(hrisApiSigningClient.toSign());
  forSigner = (id: string) => oneWithPhotos(hrisApiSigningClient.forSigner(id));
  pdf = (id: string) => hrisApiSigningClient.pdf(id);
  sendCode = (id: string, browserToken: string) => hrisApiSigningClient.sendCode(id, browserToken);
  checkCode = (id: string, code: string, browserToken: string) => hrisApiSigningClient.checkCode(id, code, browserToken);
  sign = (id: string, body: SignatureSubmission) => oneWithPhotos(hrisApiSigningClient.sign(id, body));
  decline = (id: string, reason: string) => oneWithPhotos(hrisApiSigningClient.decline(id, reason));
  drawingLink = (id: string) => hrisApiSigningClient.drawingLink(id);
  drawing = (id: string) => hrisApiSigningClient.drawing(id);

  guestView = (token: string) => hrisApiSigningClient.guestView(token);
  guestPdf = (token: string) => hrisApiSigningClient.guestPdf(token);
  guestCopy = (token: string) => hrisApiSigningClient.guestCopy(token);
  guestCode = (token: string, browserToken: string) => hrisApiSigningClient.guestCode(token, browserToken);
  guestCheckCode = (token: string, code: string, browserToken: string) =>
    hrisApiSigningClient.guestCheckCode(token, code, browserToken);
  guestSign = (token: string, body: SignatureSubmission) => hrisApiSigningClient.guestSign(token, body);
  guestDecline = (token: string, reason: string) => hrisApiSigningClient.guestDecline(token, reason);
  guestDrawingLink = (token: string) => hrisApiSigningClient.guestDrawingLink(token);
  guestDrawing = (token: string) => hrisApiSigningClient.guestDrawing(token);

  joinerView = (token: string, taskId: string) => hrisApiSigningClient.joinerView(token, taskId);
  joinerPdf = (token: string, taskId: string) => hrisApiSigningClient.joinerPdf(token, taskId);
  joinerCode = (token: string, taskId: string, browserToken: string) =>
    hrisApiSigningClient.joinerCode(token, taskId, browserToken);
  joinerCheckCode = (token: string, taskId: string, code: string, browserToken: string) =>
    hrisApiSigningClient.joinerCheckCode(token, taskId, code, browserToken);
  joinerSign = (token: string, taskId: string, body: SignatureSubmission) =>
    hrisApiSigningClient.joinerSign(token, taskId, body);
  joinerDrawingLink = (token: string, taskId: string) => hrisApiSigningClient.joinerDrawingLink(token, taskId);
  joinerDrawing = (token: string, taskId: string) => hrisApiSigningClient.joinerDrawing(token, taskId);

  drawOpen = (token: string) => hrisApiSigningClient.drawOpen(token);
  drawUpload = (token: string, drawing: string) => hrisApiSigningClient.drawUpload(token, drawing);

  sectionDocuments = (q: SectionDocumentsQuery) => hrisApiSigningClient.sectionDocuments(q);
  sectionSignings = (q: SectionFilterQuery) => hrisApiSigningClient.sectionSignings(q);
  sectionRequests = (q: SectionFilterQuery = {}) => hrisApiSigningClient.sectionRequests(q);
  sectionExpiring = (q: SectionFilterQuery = {}) => hrisApiSigningClient.sectionExpiring(q);
  sectionCounts = (q: SectionFilterQuery = {}) => hrisApiSigningClient.sectionCounts(q);
  sectionFacets = (q: Pick<SectionFilterQuery, "personIds" | "categoryIds"> = {}) => hrisApiSigningClient.sectionFacets(q);

  updateDetails = (documentId: string, body: { expiresOn?: string | null; clearExpiresOn?: boolean; description?: string | null }) =>
    hrisApiSigningClient.updateDetails(documentId, body);
  templates = () => hrisApiSigningClient.templates();
  request = (body: DocumentRequestPayload) => hrisApiSigningClient.request(body);
  uploadForRequest = (taskId: string, file: File, expiresOn: string | null) =>
    hrisApiSigningClient.uploadForRequest(taskId, file, expiresOn);
  withdrawRequest = (taskId: string) => hrisApiSigningClient.withdrawRequest(taskId);
}

export const hrisApiSigningService = new HrisApiSigningService();
