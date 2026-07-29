"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiAssignmentsService } from "@/api/modules/assignments/services/hrisAssignmentsService";
import type { AssignedUsersParams } from "@/api/modules/assignments/clients/hrisApiAssignmentsClient";
import type { AssignedUsersPage } from "@/models/assignedUser";
import type {
  AssignmentApplyDTO,
  AssignmentPreviewDTO,
  AssignmentRequest,
  AssignmentRuleDTO,
  SpringPage,
} from "@/api/modules/assignments/dto/AssignmentDTO";
import type {
  AssignmentJobStatusDTO,
  SegmentApplyRequest,
  SegmentApplyResponse,
  SegmentPreviewRequest,
  SegmentPreviewResponse,
} from "@/api/modules/assignments/dto/SegmentAssignmentDTO";

export type AssignmentActionResult<T> = {
  status: ActionStatus;
  data?: T;
  errorMessage?: string;
};

export async function assignmentPreviewAction(
  basePath: string,
  id: string,
  body: AssignmentRequest,
): Promise<AssignmentActionResult<AssignmentPreviewDTO>> {
  try {
    const data = await hrisApiAssignmentsService.preview(basePath, id, body);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("assignmentPreviewAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to preview assignment." };
  }
}

export async function assignmentApplyAction(
  basePath: string,
  id: string,
  body: AssignmentRequest,
): Promise<AssignmentActionResult<AssignmentApplyDTO>> {
  try {
    const data = await hrisApiAssignmentsService.apply(basePath, id, body);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("assignmentApplyAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to apply assignment." };
  }
}

export async function assignmentSegmentPreviewAction(
  basePath: string,
  id: string,
  body: SegmentPreviewRequest,
): Promise<AssignmentActionResult<SegmentPreviewResponse>> {
  try {
    const data = await hrisApiAssignmentsService.segmentPreview(basePath, id, body);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("assignmentSegmentPreviewAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to preview segment." };
  }
}

export async function assignmentSegmentApplyAction(
  basePath: string,
  id: string,
  body: SegmentApplyRequest,
): Promise<AssignmentActionResult<SegmentApplyResponse>> {
  try {
    const data = await hrisApiAssignmentsService.segmentApply(basePath, id, body);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("assignmentSegmentApplyAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to apply segment." };
  }
}

export async function assignmentJobStatusAction(
  basePath: string,
  id: string,
  jobId: string,
): Promise<AssignmentActionResult<AssignmentJobStatusDTO>> {
  try {
    const data = await hrisApiAssignmentsService.jobStatus(basePath, id, jobId);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("assignmentJobStatusAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to load job status." };
  }
}

export async function assignmentRulesAction(
  basePath: string,
  id: string,
  page = 0,
  size = 20,
): Promise<AssignmentActionResult<SpringPage<AssignmentRuleDTO>>> {
  try {
    const data = await hrisApiAssignmentsService.getRules(basePath, id, page, size);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("assignmentRulesAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to load assignment rules." };
  }
}

export async function assignedUsersAction(
  basePath: string,
  id: string,
  params: AssignedUsersParams,
): Promise<AssignmentActionResult<AssignedUsersPage>> {
  try {
    const data = await hrisApiAssignmentsService.listUsers(basePath, id, params);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("assignedUsersAction error:", error);
    return { status: ActionStatus.ERROR, errorMessage: "Failed to load assigned users." };
  }
}
