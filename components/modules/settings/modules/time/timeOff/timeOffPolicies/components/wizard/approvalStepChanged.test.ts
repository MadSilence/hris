import { approvalStepChanged, defaultPolicyWizardValues } from "./policyWizardTypes";

/** An edit that never touched the approval step must not write it (walk of 2026-11-05). */
describe("approvalStepChanged", () => {
  const opened = { ...defaultPolicyWizardValues, name: "Annual Leave" };

  it("is false when only the basics changed — the colour, the name", () => {
    expect(approvalStepChanged(opened, { ...opened, color: "lilac", name: "Annual" })).toBe(false);
  });

  it("is true once the approval step was touched", () => {
    expect(approvalStepChanged(opened, { ...opened, apprRequiresApproval: !opened.apprRequiresApproval })).toBe(true);
  });
});
