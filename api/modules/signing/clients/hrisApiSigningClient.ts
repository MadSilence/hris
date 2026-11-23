import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  DocumentRequestPayload,
  DocumentRequestResult,
  DocumentRequestRow,
  DocumentTemplateDTO,
  DrawingHolder,
  DrawingLink,
  DrawingPickup,
  EnvelopeDTO,
  GuestSigningView,
  SectionCounts,
  SectionDocumentsPage,
  SectionDocumentsQuery,
  SectionExpiringRow,
  SectionFacets,
  SectionFilterQuery,
  SectionSigningRow,
  SendForSignatureRequest,
  SignatureSubmission,
  SigningHistoryEvent,
} from "../dto";

const ENVELOPES = "/documents/envelopes";
const PUBLIC = "/public/sign";
const SECTION = "/documents/section";

type QueryValue = string | number | boolean | string[] | undefined | null;

function query(params: Record<string, QueryValue>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) v.forEach((x) => q.append(k, x));
    else q.append(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

/**
 * Signing and the Documents section (DOCUMENTS_PLAN.md batches 7 and 9): the sender's side, the signer's side in the
 * company, the guest's and the phone's public pages, and the company-wide lists. URLs and DTOs only.
 */
export class HrisApiSigningClient {
  // ── the sender ──
  send(body: SendForSignatureRequest) {
    return hrisApiClient.post<EnvelopeDTO>(`${ENVELOPES}/send`, body as Record<string, unknown>);
  }
  forPerson(userId: string) {
    return hrisApiClient.get<EnvelopeDTO[]>(`${ENVELOPES}/users/${userId}`);
  }
  cancel(id: string, reason: string | null) {
    return hrisApiClient.post<EnvelopeDTO>(`${ENVELOPES}/${id}/cancel`, { reason });
  }
  remind(id: string) {
    return hrisApiClient.post<EnvelopeDTO>(`${ENVELOPES}/${id}/remind`);
  }
  history(documentId: string) {
    return hrisApiClient.get<SigningHistoryEvent[]>(`${ENVELOPES}/history${query({ documentId })}`);
  }

  // ── a signer in the company ──
  toSign() {
    return hrisApiClient.get<EnvelopeDTO[]>(`${ENVELOPES}/to-sign`);
  }
  forSigner(id: string) {
    return hrisApiClient.get<EnvelopeDTO>(`${ENVELOPES}/${id}`);
  }
  pdf(id: string): Promise<Response> {
    return hrisApiClient.fetch(`${ENVELOPES}/${id}/pdf`, "application/pdf");
  }
  sendCode(id: string, browserToken: string) {
    return hrisApiClient.post<void>(`${ENVELOPES}/${id}/code`, { browserToken });
  }
  /** G0: the code checked on the code step, before the signature. */
  checkCode(id: string, code: string, browserToken: string) {
    return hrisApiClient.post<void>(`${ENVELOPES}/${id}/code/check`, { code, browserToken });
  }
  sign(id: string, body: SignatureSubmission) {
    return hrisApiClient.post<EnvelopeDTO>(`${ENVELOPES}/${id}/sign`, body as Record<string, unknown>);
  }
  decline(id: string, reason: string) {
    return hrisApiClient.post<EnvelopeDTO>(`${ENVELOPES}/${id}/decline`, { reason });
  }
  drawingLink(id: string) {
    return hrisApiClient.post<DrawingLink>(`${ENVELOPES}/${id}/drawing-link`);
  }
  drawing(id: string) {
    return hrisApiClient.get<DrawingPickup>(`${ENVELOPES}/${id}/drawing`);
  }

  // ── a guest, by the link's token (unauthenticated: the token is the credential and travels in the body) ──
  guestView(token: string) {
    return hrisApiClient.post<GuestSigningView>(`${PUBLIC}/view`, { token });
  }
  guestPdf(token: string): Promise<Response> {
    return hrisApiClient.postForBinary(`${PUBLIC}/pdf`, { token }, "application/pdf");
  }
  guestCopy(token: string): Promise<Response> {
    return hrisApiClient.postForBinary(`${PUBLIC}/copy`, { token }, "application/pdf");
  }
  guestCode(token: string, browserToken: string) {
    return hrisApiClient.post<void>(`${PUBLIC}/code`, { token, browserToken });
  }
  guestCheckCode(token: string, code: string, browserToken: string) {
    return hrisApiClient.post<void>(`${PUBLIC}/code/check`, { token, code, browserToken });
  }
  guestSign(token: string, body: SignatureSubmission) {
    return hrisApiClient.post<EnvelopeDTO>(`${PUBLIC}/sign`, { token, ...body });
  }
  guestDecline(token: string, reason: string) {
    return hrisApiClient.post<EnvelopeDTO>(`${PUBLIC}/decline`, { token, reason });
  }
  guestDrawingLink(token: string) {
    return hrisApiClient.post<DrawingLink>(`${PUBLIC}/drawing-link`, { token });
  }
  guestDrawing(token: string) {
    return hrisApiClient.post<DrawingPickup>(`${PUBLIC}/drawing`, { token });
  }

  // ── a new joiner, from their preboarding page (P08): the page's token and the SIGN task ──
  joinerView(token: string, taskId: string) {
    return hrisApiClient.post<EnvelopeDTO>(`/public/preboarding/tasks/${taskId}/sign/view`, { token });
  }
  joinerPdf(token: string, taskId: string): Promise<Response> {
    return hrisApiClient.postForBinary(`/public/preboarding/tasks/${taskId}/sign/pdf`, { token }, "application/pdf");
  }
  joinerCode(token: string, taskId: string, browserToken: string) {
    return hrisApiClient.post<void>(`/public/preboarding/tasks/${taskId}/sign/code`, { token, browserToken });
  }
  joinerCheckCode(token: string, taskId: string, code: string, browserToken: string) {
    return hrisApiClient.post<void>(`/public/preboarding/tasks/${taskId}/sign/code/check`, { token, code, browserToken });
  }
  joinerSign(token: string, taskId: string, body: SignatureSubmission) {
    return hrisApiClient.post<unknown>(`/public/preboarding/tasks/${taskId}/sign`, { token, ...body });
  }
  joinerDrawingLink(token: string, taskId: string) {
    return hrisApiClient.post<DrawingLink>(`/public/preboarding/tasks/${taskId}/sign/drawing-link`, { token });
  }
  joinerDrawing(token: string, taskId: string) {
    return hrisApiClient.post<DrawingPickup>(`/public/preboarding/tasks/${taskId}/sign/drawing`, { token });
  }

  // ── the phone page ──
  drawOpen(token: string) {
    return hrisApiClient.post<DrawingHolder>(`${PUBLIC}/draw/open`, { token });
  }
  drawUpload(token: string, drawing: string) {
    return hrisApiClient.post<void>(`${PUBLIC}/draw/upload`, { token, drawing });
  }

  // ── the Documents section and the expiring list ──
  sectionDocuments(q: SectionDocumentsQuery) {
    return hrisApiClient.get<SectionDocumentsPage>(`${SECTION}/documents${query(q as Record<string, QueryValue>)}`);
  }
  sectionSignings(q: SectionFilterQuery) {
    return hrisApiClient.get<SectionSigningRow[]>(`${SECTION}/signings${query(q as Record<string, QueryValue>)}`);
  }
  sectionRequests(q: SectionFilterQuery = {}) {
    return hrisApiClient.get<DocumentRequestRow[]>(`${SECTION}/requests${query(q as Record<string, QueryValue>)}`);
  }
  /** What is expiring, filtered like the other views, with "Asked on" (D02, DS5, DS16). */
  sectionExpiring(q: SectionFilterQuery = {}) {
    return hrisApiClient.get<SectionExpiringRow[]>(`${SECTION}/expiring${query(q as Record<string, QueryValue>)}`);
  }
  /** The Person and Category menus with their counts (D05). */
  sectionFacets(q: Pick<SectionFilterQuery, "personIds" | "categoryIds"> = {}) {
    return hrisApiClient.get<SectionFacets>(`${SECTION}/facets${query(q as Record<string, QueryValue>)}`);
  }
  /** The view switch's counts, following the filters (DS5). */
  sectionCounts(q: SectionFilterQuery = {}) {
    return hrisApiClient.get<SectionCounts>(`${SECTION}/counts${query(q as Record<string, QueryValue>)}`);
  }

  /** A document's date and description (documents-expiry X04); `clearExpiresOn` removes the date. */
  updateDetails(documentId: string, body: { expiresOn?: string | null; clearExpiresOn?: boolean; description?: string | null }) {
    return hrisApiClient.patch<unknown, typeof body>(`/documents/${documentId}`, body);
  }

  // ── templates (the read the automation step and the process task pick from) ──
  templates() {
    return hrisApiClient.get<DocumentTemplateDTO[]>(`/documents/templates`);
  }

  // ── requests ──
  request(body: DocumentRequestPayload) {
    return hrisApiClient.post<DocumentRequestResult>(`/documents/requests`, body as Record<string, unknown>);
  }
  uploadForRequest(taskId: string, file: File, expiresOn: string | null) {
    const form = new FormData();
    form.append("file", file);
    if (expiresOn) form.append("expiresOn", expiresOn);
    return hrisApiClient.postForm<unknown>(`/documents/requests/${taskId}/upload`, form);
  }
  withdrawRequest(taskId: string) {
    return hrisApiClient.post<void>(`/documents/requests/${taskId}/withdraw`);
  }
}

export const hrisApiSigningClient = new HrisApiSigningClient();
