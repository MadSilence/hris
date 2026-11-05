import { TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";
import { panelOrder, type PolicyStanding } from "./TimeOffSidePanel";

const standing = (over: Partial<PolicyStanding>): PolicyStanding => ({
  policyId: over.name ?? "p",
  name: "Policy",
  color: null,
  unlimited: false,
  unit: TimeOffPolicyUnit.Days,
  left: 0,
  used: 0,
  vacation: false,
  ...over,
});

describe("panelOrder — the owner's order of a person's balances (C5)", () => {
  it("puts a vacation policy first, however little it was used", () => {
    const order = panelOrder([
      standing({ name: "Sick", used: 9, left: 1 }),
      standing({ name: "Vacation Poland", vacation: true, used: 0, left: 26 }),
    ]);
    expect(order.map((s) => s.name)).toEqual(["Vacation Poland", "Sick"]);
  });

  it("of several vacation policies, the one with more days left leads", () => {
    const order = panelOrder([
      standing({ name: "Vacation A", vacation: true, left: 3 }),
      standing({ name: "Vacation B", vacation: true, left: 20 }),
    ]);
    expect(order.map((s) => s.name)).toEqual(["Vacation B", "Vacation A"]);
  });

  it("orders the rest by use, and keeps an unused unlimited policy out", () => {
    const order = panelOrder([
      standing({ name: "Training", used: 1, left: 4 }),
      standing({ name: "Sick", used: 5, left: 5 }),
      standing({ name: "Parental", unlimited: true, used: 0 }),
    ]);
    expect(order.map((s) => s.name)).toEqual(["Sick", "Training"]);
  });
});
