import {
  assignmentSkippedEverything,
  describeSkips,
  skipReasonText,
} from "./assignmentSkips";
import { translatorFor } from "@/test/nextIntl";
import type { AccessTranslator } from "@/components/audience/accessTranslator";
import type {
  AssignmentApplyDTO,
  AssignmentSkippedUser,
} from "@/api/modules/assignments/dto/AssignmentDTO";

const t = translatorFor("access") as unknown as AccessTranslator;

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
    expect(skipReasonText("DUPLICATE", t)).toBe("already there");
    expect(skipReasonText("USER_ARCHIVED", t)).toBe("archived");
    expect(skipReasonText("USER_NOT_FOUND", t)).toBe("no longer exists");
    expect(skipReasonText("INVALID_TARGET", t)).toBe("cannot be assigned here");
    expect(skipReasonText("DOMAIN_ERROR", t)).toBe("rejected by the system");
    expect(skipReasonText("HAND_OVERRIDE", t)).toBe("set by hand to something else");
    expect(skipReasonText("RULE_CONFLICT", t)).toBe("another rule sets this for them");
  });
});

describe("describeSkips", () => {
  it("names the person when there is only one", () => {
    expect(describeSkips([skipped()], t)).toBe("Nikita Orlov was not added — archived.");
  });

  it("falls back to the email when there is no name", () => {
    expect(describeSkips([skipped({ firstName: "", lastName: "" })], t)).toContain(
      "nikita@example.com",
    );
  });

  it("counts by reason once there are several", () => {
    const message = describeSkips([
      skipped({ userId: "u-1", reason: "DUPLICATE" }),
      skipped({ userId: "u-2", reason: "DUPLICATE" }),
      skipped({ userId: "u-3", reason: "USER_ARCHIVED" }),
    ], t);

    expect(message).toBe("3 people were not added: 2 already there, 1 archived.");
  });

  it("says nothing when nothing was skipped", () => {
    expect(describeSkips([], t)).toBeNull();
  });
});

describe("assignmentSkippedEverything", () => {
  it("reports when the apply assigned nobody", () => {
    const message = assignmentSkippedEverything(
      applyResult({ skipped: [skipped()], summary: { total: 1, created: 0, skipped: 1, failed: 0 } }),
      t,
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
      t,
    );

    expect(message).toBeNull();
  });

  it("stays quiet on a clean apply and on a missing result", () => {
    expect(assignmentSkippedEverything(applyResult(), t)).toBeNull();
    expect(assignmentSkippedEverything(undefined, t)).toBeNull();
  });
});
