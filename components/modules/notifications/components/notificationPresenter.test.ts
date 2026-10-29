import { Lock } from "lucide-react";
import { presentNotification } from "./notificationPresenter";
import type { Notification } from "@/models/notifications";

const notification = (over: Partial<Notification>): Notification => ({
  id: "n1",
  type: "UNKNOWN",
  category: "SYSTEM",
  params: {},
  targetType: null,
  targetId: null,
  sourceType: null,
  sourceId: null,
  seen: false,
  read: false,
  starred: false,
  createdAt: "2026-09-14T10:00:00Z",
  source: null,
  ...over,
});

/** Every type the backend registry sends (`NotificationTypeRegistry`). A type missing here falls back to its code. */
const REGISTERED_TYPES = [
  "TIMEOFF_APPROVAL_REQUESTED",
  "TIMEOFF_REQUEST_APPROVED",
  "TIMEOFF_REQUEST_REJECTED",
  "TIMEOFF_CANCELLATION_APPROVED",
  "TIMEOFF_CANCELLATION_DECLINED",
  "TIMEOFF_LEAVE_CANCELLED",
  "TIMEOFF_CANCELLATION_REQUESTED",
  "TIMEOFF_REQUEST_CANCELLED",
  "TIMEOFF_POLICY_ASSIGNED",
  "TIMEOFF_POLICY_ENDED",
  "TIMEOFF_BALANCE_ADJUSTED",
  "TIMEOFF_REQUEST_REPRICED",
  "TIMEOFF_APPROVALS_DELEGATED",
  "ROLE_ASSIGNMENT_CREATED",
  "ROLE_ASSIGNMENT_REMOVED",
  "MANAGER_CHANGED",
  "ORG_UNIT_ASSIGNED",
  "ORG_UNIT_UNASSIGNED",
  "POSITION_CHANGED",
  "PUBLIC_HOLIDAY_CALENDAR_SOURCE_DRIFT",
  "LIFECYCLE_PROCESS_STEP_FAILED",
  "LIFECYCLE_TASKS_ASSIGNED",
  "INVITATION_FAILED",
  "ROLE_ACCESS_CHANGED",
  "ROLE_HOLDERS_CHANGED",
  "ACCOUNT_LOCKED",
  "DOCUMENT_ADDED_TO_FILE",
  "AUTOMATION_MESSAGE",
  "AUTOMATION_TASK_ASSIGNED",
  "AUTOMATION_RUN_FAILED",
  "AUTOMATION_RULE_PAUSED",
];

describe("presentNotification", () => {
  it.each(REGISTERED_TYPES)("%s has its own text, not the humanised code", (type) => {
    const view = presentNotification(notification({ type, params: {} }));

    expect(view.title).not.toBe(type.replaceAll("_", " ").toLowerCase());
    expect(view.message).not.toBe("");
  });

  describe("time off, to the requester", () => {
    it("says who approved it and links to their own Time Off tab", () => {
      const view = presentNotification(
        notification({
          type: "TIMEOFF_REQUEST_APPROVED",
          params: { requesterId: "u1", policyName: "Annual Leave", startDate: "2026-10-01", endDate: "2026-10-03", actorName: "Ada Lovelace" },
        }),
      );

      expect(view.message).toMatch(/^Your Annual Leave request .+ was approved by Ada Lovelace\.$/);
      expect(view.href).toBe("/organization/people/u1/time-off");
    });

    it("carries the reason of a rejection", () => {
      const view = presentNotification(
        notification({ type: "TIMEOFF_REQUEST_REJECTED", params: { requesterId: "u1", reason: "Release week" } }),
      );

      expect(view.message).toMatch(/Reason: Release week$/);
    });

    it("says how many days came back when a cancellation is agreed", () => {
      const view = presentNotification(
        notification({ type: "TIMEOFF_CANCELLATION_APPROVED", params: { requesterId: "u1", restoredAmount: "2" } }),
      );

      expect(view.message).toMatch(/2 days went back to your balance\.$/);
    });
  });

  describe("ROLE_HOLDERS_CHANGED", () => {
    it("names the one person, or counts a batch", () => {
      const one = presentNotification(
        notification({ type: "ROLE_HOLDERS_CHANGED", params: { roleId: "r1", roleName: "HR Admin", added: true, count: 1, personName: "Bo", actorName: "Ada" } }),
      );
      const many = presentNotification(
        notification({ type: "ROLE_HOLDERS_CHANGED", params: { roleName: "HR Admin", added: false, count: 12, actorName: "Ada" } }),
      );

      expect(one.message).toBe("Ada gave HR Admin to Bo.");
      expect(one.href).toBe("/settings/people/roles/r1");
      expect(many.message).toBe("Ada took HR Admin from 12 people.");
    });
  });

  describe("LIFECYCLE_TASKS_ASSIGNED", () => {
    it("counts the recipient's tasks and links to the task list", () => {
      const view = presentNotification(
        notification({ type: "LIFECYCLE_TASKS_ASSIGNED", params: { targetName: "Bo", processType: "ONBOARDING", taskCount: 3 } }),
      );

      expect(view.message).toBe("Bo's onboarding started, and 3 tasks are yours.");
      expect(view.href).toBe("/tasks");
    });
  });

  describe("ACCOUNT_LOCKED", () => {
    it("names the person, says what unlocks it, and links to their profile", () => {
      const view = presentNotification(
        notification({ type: "ACCOUNT_LOCKED", params: { userId: "u42", name: "Ada Lovelace" } }),
      );

      expect(view.title).toBe("Account Locked");
      expect(view.message).toBe(
        "Ada Lovelace's account was locked after too many failed sign-in attempts. Send them a password reset to unlock it.",
      );
      expect(view.Icon).toBe(Lock);
      expect(view.href).toBe("/organization/people/u42/personal");
    });

    it("does not link anywhere when the person is not named in the params", () => {
      const view = presentNotification(notification({ type: "ACCOUNT_LOCKED", params: {} }));

      expect(view.href).toBeNull();
      expect(view.message).toMatch(/^Somebody's account was locked/);
    });
  });
});

describe("an approval request leads to the request itself (WALK_QUESTIONS § 7)", () => {
  it("opens the request's own page, where the decision's context sits beside Approve and Reject", () => {
    const p = presentNotification(notification({
      type: "TIMEOFF_APPROVAL_REQUESTED",
      targetType: "TIME_OFF_REQUEST",
      targetId: "req-1",
      params: { requesterId: "u-1", requesterName: "Ada", amount: "2" },
    }));
    expect(p.href).toBe("/time-off/requests/req-1");
  });

  it("falls back to the person's time off when the notification carries no request", () => {
    const p = presentNotification(notification({ type: "TIMEOFF_APPROVAL_REQUESTED", params: { requesterId: "u-1" } }));
    expect(p.href).toBe("/organization/people/u-1/time-off");
  });
});

describe("a holiday drift", () => {
  const drift = (status: string | null, open: boolean) =>
    presentNotification(
      notification({
        type: "PUBLIC_HOLIDAY_CALENDAR_SOURCE_DRIFT",
        params: { calendarName: "Germany", year: 2027, added: 1 },
        source: status === null ? null : { type: "PUBLIC_HOLIDAY_DRIFT", id: "d1", status, open, details: null },
      }),
    ).message;

  it("waits for someone to apply it while it is open", () => {
    expect(drift("OPEN", true)).toMatch(/Nothing changes until someone applies it\.$/);
  });

  // Every calendar manager holds a copy; one Apply closes them all.
  it("says it was applied once somebody applied it", () => {
    expect(drift("APPLIED", false)).toMatch(/It has been applied\.$/);
  });

  it("says nothing changed once it was dismissed", () => {
    expect(drift("DISMISSED", false)).toMatch(/dismissed; nothing changed\.$/);
  });
});

describe("a holiday conflict — the source changed days the company edited", () => {
  const conflict = (status: string) =>
    presentNotification(
      notification({
        type: "PUBLIC_HOLIDAY_CALENDAR_SOURCE_DRIFT",
        params: { calendarName: "Germany", year: 2027, changed: 1, conflict: true },
        source: { type: "PUBLIC_HOLIDAY_DRIFT", id: "d1", status, open: status === "OPEN", details: null },
      }),
    );

  it("asks about the edited days and blocks nothing while open", () => {
    const p = conflict("OPEN");
    expect(p.title).toBe("Your Holiday Edits Differ from the Source");
    expect(p.message).toMatch(/changed days you edited: 1 changed\./);
    expect(p.message).toMatch(/Your version stays in force until someone takes the source's\.$/);
  });

  it("follows the answer: kept, or taken", () => {
    expect(conflict("DISMISSED").message).toMatch(/Your version was kept\.$/);
    expect(conflict("APPLIED").message).toMatch(/The source's version was taken\.$/);
  });
});

describe("approvals for somebody else", () => {
  it("a delegate's copy of an approval request says whom it is for", () => {
    const view = presentNotification(
      notification({
        type: "TIMEOFF_APPROVAL_REQUESTED",
        params: { requesterName: "Bob Builder", amount: "2", onBehalfOfName: "Anna Approver" },
      }),
    );
    expect(view.message).toMatch(/· for Anna Approver$/);
  });

  it("a delegate's copy of a cancellation request says whom it is for", () => {
    const view = presentNotification(
      notification({
        type: "TIMEOFF_CANCELLATION_REQUESTED",
        params: { requesterName: "Bob Builder", startDate: "2026-11-02", endDate: "2026-11-06", onBehalfOfName: "Anna Approver" },
      }),
    );
    expect(view.message).toMatch(/asks to cancel approved time off · .+ · for Anna Approver\./);
  });

  it("the approver's own copy says nothing of the kind", () => {
    const view = presentNotification(
      notification({ type: "TIMEOFF_APPROVAL_REQUESTED", params: { requesterName: "Bob Builder", amount: "2" } }),
    );
    expect(view.message).not.toMatch(/for /);
  });

  it("tells a person their leave costs a different number of days after a holiday change", () => {
    const view = presentNotification(
      notification({
        type: "TIMEOFF_REQUEST_REPRICED",
        params: { userId: "u-1", policyName: "Annual Leave", startDate: "2026-12-21", endDate: "2026-12-24", previousAmount: "4", amount: "3" },
      }),
    );
    expect(view.title).toBe("Time Off Re-priced");
    expect(view.message).toMatch(/^The holidays under your Annual Leave request .+ changed, so it now costs 3 days instead of 4 days\.$/);
    expect(view.href).toBe("/organization/people/u-1/time-off");
  });

  it("a delegation tells the delegate who, when and why, and leads to their preferences", () => {
    const view = presentNotification(
      notification({
        type: "TIMEOFF_APPROVALS_DELEGATED",
        params: { delegatorName: "Anna Approver", startDate: "2026-11-02", endDate: "2026-11-06", delegationSource: "LEAVE" },
      }),
    );
    expect(view.title).toBe("Approvals Delegated to You");
    expect(view.message).toMatch(/^Anna Approver delegated their leave approvals to you · .+, while they are on leave\./);
    expect(view.href).toBe("/preferences");
  });

  describe("automations", () => {
    it("shows a rule's own message under the rule's name, linked to the person", () => {
      const view = presentNotification(
        notification({ type: "AUTOMATION_MESSAGE", params: { ruleName: "Welcome", text: "Anna starts on Monday.", personId: "p1" } }),
      );

      expect(view.title).toBe("Welcome");
      expect(view.message).toBe("Anna starts on Monday.");
      expect(view.href).toBe("/organization/people/p1/personal");
    });

    it("names the task, whom it is for and the rule that set it", () => {
      const view = presentNotification(
        notification({ type: "AUTOMATION_TASK_ASSIGNED", params: { taskTitle: "Prepare a desk", personName: "Anna", ruleName: "First day", dueDate: "2026-11-03" } }),
      );

      expect(view.title).toBe("A Task for You");
      expect(view.message).toMatch(/^Prepare a desk for Anna — set by the automation First day. Due .+.$/);
      expect(view.href).toBe("/tasks");
    });

    it("tells the author which run failed and why, and links to the rule", () => {
      const view = presentNotification(
        notification({ type: "AUTOMATION_RUN_FAILED", params: { automationRuleId: "r1", ruleName: "Welcome", personName: "Anna", error: "MISSING_PLACEHOLDER: managerName" } }),
      );

      expect(view.title).toBe("Automation Failed");
      expect(view.message).toBe("Welcome could not finish for Anna: MISSING_PLACEHOLDER: managerName. Open its run log to retry.");
      expect(view.href).toBe("/settings/automation/automations/r1");
    });

    it("says a rule was paused and why", () => {
      const view = presentNotification(
        notification({ type: "AUTOMATION_RULE_PAUSED", params: { automationRuleId: "r1", ruleName: "Berlin calendar", reason: "The calendar was archived." } }),
      );

      expect(view.title).toBe("Automation Paused");
      expect(view.message).toBe("Berlin calendar was paused: something it uses is gone. The calendar was archived. Fix it and resume the rule.");
      expect(view.href).toBe("/settings/automation/automations/r1");
    });
  });
});
