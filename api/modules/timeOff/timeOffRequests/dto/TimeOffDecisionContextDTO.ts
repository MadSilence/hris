import type { EmployeeTimeOffBalanceDTO } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import type { TimeOffOverlapDTO } from "./TimeOffOverlapDTO";
import type { TimeOffRequestDTO } from "./TimeOffRequestDTO";
import type { TimeOffApprovalStepDTO, TimeOffApprovalVia } from "./TimeOffApprovalStepDTO";

/**
 * What an approver needs to answer one request (`GET /time-off/requests/{id}/decision-context`,
 * WALK_QUESTIONS § 7). Readable by the person the request waits on, for as long as it waits.
 */
export interface TimeOffDecisionContextDTO {
  request: TimeOffRequestDTO;
  requesterName: string | null;
  balance: EmployeeTimeOffBalanceDTO | null;
  otherLeave: TimeOffRequestDTO[];
  peersAway: TimeOffOverlapDTO[];
  awaitingYou: boolean;
  /** How it reaches the reader, when it does: their own step, as a delegate, or as the fallback. */
  answeringAs: TimeOffApprovalVia | null;
  /** Under a delegation, the approver the reader would answer for ("for Anna"). */
  answeringOnBehalfOfName: string | null;
  /** The reader may decide over the chain (Approve Anyway), and the request is pending. */
  canDecideAnyway: boolean;
  /** The chain step by step. Empty for the requester, who is not shown who approves their leave. */
  steps: TimeOffApprovalStepDTO[];
}
