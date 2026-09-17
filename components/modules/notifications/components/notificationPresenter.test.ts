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
  "ROLE_ASSIGNMENT_CREATED",
  "ROLE_ASSIGNMENT_REMOVED",
  "MANAGER_CHANGED",
  "ORG_UNIT_ASSIGNED",
  "ORG_UNIT_UNASSIGNED",
  "POSITION_CHANGED",
  "PUBLIC_HOLIDAY_CALENDAR_SOURCE_DRIFT",
  "LIFECYCLE_PROCESS_STEP_FAILED",
  "LIFECYCLE_TASKS_ASSIGNED",
  "ROLE_ACCESS_CHANGED",
  "ROLE_HOLDERS_CHANGED",
  "ACCOUNT_LOCKED",
  "DOCUMENT_ADDED_TO_FILE",
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
