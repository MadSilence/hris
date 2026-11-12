"use server";

// Every export is an explicit `async function`: Next refuses anything else in a "use server" file.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiReportsService } from "@/api/modules/reports/services";
import type { CreateResponse } from "@/api/models/misc";
import type {
  ReportCreateRequest,
  ReportDTO,
  ReportPublishedDTO,
  ReportPublishRequest,
  ReportShareDTO,
  ReportShareRequest,
  ReportUpdateRequest,
  ReportUpdateShareRequest,
} from "@/api/modules/reports/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

async function run<T>(context: string, body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await body() };
  } catch (error) {
    return toActionError(error, context);
  }
}

export async function createReportAction(input: ReportCreateRequest): Promise<ActionResult<CreateResponse>> {
  return run("createReportAction", () => hrisApiReportsService.create(input));
}

/** Partial: only what is sent changes. Name and description are the owner's; an editor may change the definition. */
export async function updateReportAction(input: { id: string; body: ReportUpdateRequest }): Promise<ActionResult<ReportDTO>> {
  return run("updateReportAction", () => hrisApiReportsService.update(input.id, input.body));
}

export async function deleteReportAction(id: string): Promise<ActionResult<void>> {
  return run("deleteReportAction", () => hrisApiReportsService.delete(id));
}

/** "Duplicate" on one's own report, "Save a copy" on a shared one — either way the copy is the caller's. */
export async function duplicateReportAction(id: string): Promise<ActionResult<ReportDTO>> {
  return run("duplicateReportAction", () => hrisApiReportsService.duplicate(id));
}

/** Answers with every share of the report after the change. */
export async function shareReportAction(input: { id: string; body: ReportShareRequest }): Promise<ActionResult<ReportShareDTO[]>> {
  return run("shareReportAction", () => hrisApiReportsService.share(input.id, input.body));
}

export async function updateReportShareAction(input: {
  id: string;
  shareId: string;
  body: ReportUpdateShareRequest;
}): Promise<ActionResult<ReportShareDTO>> {
  return run("updateReportShareAction", () => hrisApiReportsService.updateShare(input.id, input.shareId, input.body));
}

export async function unshareReportAction(input: { id: string; shareId: string }): Promise<ActionResult<void>> {
  return run("unshareReportAction", () => hrisApiReportsService.unshare(input.id, input.shareId));
}

/** The token in the answer is shown once — only its hash is kept. */
export async function publishReportAction(input: { id: string; body: ReportPublishRequest }): Promise<ActionResult<ReportPublishedDTO>> {
  return run("publishReportAction", () => hrisApiReportsService.publish(input.id, input.body));
}

export async function revokeReportPublicationAction(publicationId: string): Promise<ActionResult<void>> {
  return run("revokeReportPublicationAction", () => hrisApiReportsService.revokePublication(publicationId));
}
