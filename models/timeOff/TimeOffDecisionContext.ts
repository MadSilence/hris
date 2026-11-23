import type { EmployeeTimeOffBalance } from "./EmployeeTimeOffBalance";
import type { TimeOffRequest } from "./TimeOffRequest";
import type { TimeOffOverlapDTO } from "@/api/modules/timeOff/timeOffRequests/dto/TimeOffOverlapDTO";
import type {
  TimeOffApprovalStepDTO,
  TimeOffApprovalVia,
  TimeOffChainDTO,
} from "@/api/modules/timeOff/timeOffRequests/dto/TimeOffApprovalStepDTO";

/**
 * Everything one decision on leave needs, on one screen: the request, the balance it draws on, the
 * requester's leave around it, and who else is away over the same days. `awaitingYou` is whether the
 * reader is the one it waits on — the screen offers Approve and Reject only then.
 */
export interface TimeOffDecisionContext {
  request: TimeOffRequest;
  requesterName: string | null;
  balance: EmployeeTimeOffBalance | null;
  otherLeave: TimeOffRequest[];
  peersAway: TimeOffOverlapDTO[];
  awaitingYou: boolean;
  answeringAs: TimeOffApprovalVia | null;
  answeringOnBehalfOfName: string | null;
  canDecideAnyway: boolean;
  steps: TimeOffApprovalStepDTO[];
  /** The request's leave type ("Vacation"), never the policy's name — Home writes "3 days of vacation" (widgets A9). */
  leaveTypeName?: string | null;
  /** The policy counts working days: "3 working days" (widgets W14). */
  workingDays?: boolean;
  /** Where the approval stands (AQ-04): the requester's count and names, how an approver's steps are drawn. */
  chain: TimeOffChainDTO | null;
  /** Cancelling it goes to the approver ("Ask to cancel") rather than taking effect at once ("Cancel time off"). */
  cancelNeedsApproval: boolean;
}
