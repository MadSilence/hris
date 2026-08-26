import {
  assignmentSkippedEverything,
  describeSkips,
  skipReasonText,
} from "./assignmentSkips";
import type {
  AssignmentApplyDTO,
  AssignmentSkippedUser,
} from "@/api/modules/assignments/dto/AssignmentDTO";

const skipped = (
  overrides: Partial<AssignmentSkippedUser> = {},
): AssignmentSkippedUser => ({
  userId: "u-1",
  firstName: "Nikita",
  lastName: "Orlov",
  email: "nikita@example.com",
  reason: "USER_ARCHIVED",
  ...overrides,
});

const applyResult = (overrides: Partial<AssignmentApplyDTO> = {}): AssignmentApplyDTO => ({
  ruleId: "rule-1",
  created: [],
  skipped: [],
  failed: [],
  summary: { total: 0, created: 0, skipped: 0, failed: 0 },
  ...overrides,
});

describe("skipReasonText", () => {
  it("has words for every reason the engine can return", () => {
    expect(skipReasonText("DUPLICATE")).toBe("already there");
    expect(skipReasonText("USER_ARCHIVED")).toBe("archived");
    expect(skipReasonText("USER_NOT_FOUND")).toBe("no longer exists");
    expect(skipReasonText("INVALID_TARGET")).toBe("cannot be assigned here");
    expect(skipReasonText("DOMAIN_ERROR")).toBe("rejected by the system");
  });
});

describe("describeSkips", () => {
  it("names the person when there is only one", () => {
    expect(describeSkips([skipped()])).toBe("Nikita Orlov was not added — archived.");
  });

  it("falls back to the email when there is no name", () => {
    expect(describeSkips([skipped({ firstName: "", lastName: "" })])).toContain(
      "nikita@example.com",
    );
  });

  it("counts by reason once there are several", () => {
    const message = describeSkips([
      skipped({ userId: "u-1", reason: "DUPLICATE" }),
      skipped({ userId: "u-2", reason: "DUPLICATE" }),
      skipped({ userId: "u-3", reason: "USER_ARCHIVED" }),
    ]);

    expect(message).toBe("3 people were not added: 2 already there, 1 archived.");
  });

  it("says nothing when nothing was skipped", () => {
    expect(describeSkips([])).toBeNull();
  });
});

describe("assignmentSkippedEverything", () => {
  it("reports when the apply assigned nobody", () => {
    const message = assignmentSkippedEverything(
      applyResult({ skipped: [skipped()], summary: { total: 1, created: 0, skipped: 1, failed: 0 } }),
    );

    expect(message).toBe("Nikita Orlov was not added — archived.");
  });

  it("stays quiet when something was created — a partial apply is not a failure", () => {
    const message = assignmentSkippedEverything(
      applyResult({
        created: [{ userId: "u-9", firstName: "Ada", lastName: "L", email: "ada@example.com" }],
        skipped: [skipped()],
        summary: { total: 2, created: 1, skipped: 1, failed: 0 },
      }),
    );

    expect(message).toBeNull();
  });

  it("stays quiet on a clean apply and on a missing result", () => {
    expect(assignmentSkippedEverything(applyResult())).toBeNull();
    expect(assignmentSkippedEverything(undefined)).toBeNull();
  });
});
