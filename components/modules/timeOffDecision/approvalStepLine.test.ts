import { approvalStepLine } from "./TimeOffDecisionContainer";
import type { TimeOffApprovalStepDTO } from "@/api/modules/timeOff/timeOffRequests/dto";
import { translatorFor } from "@/test/nextIntl";

const t = translatorFor("timeOff") as unknown as Parameters<typeof approvalStepLine>[1];

const step = (over: Partial<TimeOffApprovalStepDTO>): TimeOffApprovalStepDTO => ({
  approvalOrder: 1,
  approverType: "MANAGER",
  askedUserId: "anna",
  askedUserName: "Anna Approver",
  askedRoleName: null,
  askedReason: "RESOLVED",
  reassignedToUserId: null,
  reassignedToName: null,
  signed: false,
  decidedBy: null,
  decidedByName: null,
  via: null,
  onBehalfOfUserId: null,
  onBehalfOfName: null,
  decidedAt: null,
  ...over,
});

describe("approvalStepLine", () => {
  it("Asked: Anna · Answered by Maria on behalf of Anna", () => {
    expect(
      approvalStepLine(step({ signed: true, decidedByName: "Maria Delegate", via: "DELEGATE", onBehalfOfName: "Anna Approver" }), t),
    ).toEqual({ asked: "Anna Approver", answered: "Maria Delegate on behalf of Anna Approver" });
  });

  it("keeps who was originally asked when the step was reassigned", () => {
    expect(approvalStepLine(step({ reassignedToName: "Erin Successor" }), t).asked).toBe(
      "Anna Approver, reassigned to Erin Successor",
    );
  });

  it("names the fallback role a step went to, and the fallback who answered", () => {
    const line = approvalStepLine(
      step({
        askedUserId: null,
        askedUserName: null,
        askedReason: "FALLBACK",
        askedRoleName: "HR Admin",
        signed: true,
        decidedByName: "Helen Hr",
        via: "FALLBACK",
      }),
      t,
    );
    expect(line).toEqual({ asked: "the HR Admin role", answered: "Helen Hr, as the fallback" });
  });

  it("a step closed by Approve anyway names the administrator who decided over it", () => {
    const line = approvalStepLine(step({ signed: true, decidedByName: "Ada Admin", via: "OVERRIDE" }), t);
    expect(line.answered).toBe("Ada Admin, approving anyway");
  });

  it("an open step has no answer yet", () => {
    expect(approvalStepLine(step({}), t).answered).toBeNull();
  });
});
