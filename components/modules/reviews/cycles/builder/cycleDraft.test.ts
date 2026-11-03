import type { Cycle } from "@/models/reviews";
import { cycleDraftOf, draftProblems, newCycleDraft, sameCycleDraft, toCycleWrite } from "./cycleDraft";

const cycle = (patch: Partial<Cycle> = {}): Cycle => ({
  id: "c1",
  name: "H2 review",
  description: null,
  status: "DRAFT",
  segment: { filters: [], excludeUserIds: [] },
  eligibleHiredBefore: "2026-09-01",
  scale: [
    { value: 1, label: "Low" },
    { value: 2, label: "Mid" },
    { value: 3, label: "High" },
  ],
  sharingMode: "RELEASED_ON_DATE",
  releaseDate: "2026-12-01",
  ownerUserId: null,
  ownerName: null,
  kinds: [
    { kind: "PEER", formId: "f2", formName: "Peer", formArchived: false, questionCount: 2, opensOn: null, dueOn: "2026-11-20",
      anonymous: false, anonymityThreshold: 4, peerMin: 1, peerMax: 3, reviewerCap: 4, peerMode: "ADMIN_SELECTS",
      nominationDueOn: null, approvalDueOn: null },
  ],
  launchedAt: null,
  releasedAt: null,
  closedAt: null,
  createdAt: "2026-11-03T10:00:00",
  version: 2,
  approvalMode: "NONE",
  approverUserId: null,
  approverName: null,
  template: false,
  ...patch,
});

describe("cycle draft", () => {
  it("starts with self and manager reviews on, peers off, and the five-point scale", () => {
    const d = newCycleDraft();
    expect(d.kinds.SELF.enabled && d.kinds.MANAGER.enabled).toBe(true);
    expect(d.kinds.PEER.enabled).toBe(false);
    expect(d.scale).toHaveLength(5);
    expect(toCycleWrite(d, null).kinds.map((k) => k.kind)).toEqual(["SELF", "MANAGER"]);
  });

  it("reads a saved cycle back into the same write", () => {
    const d = cycleDraftOf(cycle());
    expect(d.kinds.PEER).toMatchObject({ enabled: true, formId: "f2", anonymous: false, peerMin: 1, peerMax: 3, reviewerCap: 4 });
    expect(d.kinds.SELF.enabled).toBe(false);
    const write = toCycleWrite(d, 2);
    expect(write).toMatchObject({ name: "H2 review", releaseDate: "2026-12-01", version: 2 });
    expect(write.kinds).toEqual([{ kind: "PEER", formId: "f2", opensOn: null, dueOn: "2026-11-20", anonymous: false, anonymityThreshold: 4, peerMin: 1, peerMax: 3, reviewerCap: 4, peerMode: "ADMIN_SELECTS" }]);
  });

  it("starts the anonymity threshold at three and refuses one outside two to ten", () => {
    const d = newCycleDraft();
    expect(d.kinds.PEER.anonymityThreshold).toBe(3);
    d.kinds.PEER = { ...d.kinds.PEER, enabled: true, anonymityThreshold: 1 };
    expect(draftProblems(d)).toContain("The anonymity threshold runs from 2 to 10.");
    d.kinds.PEER = { ...d.kinds.PEER, anonymous: false };
    expect(draftProblems(d)).not.toContain("The anonymity threshold runs from 2 to 10.");
  });

  it("drops the release date when the manager shares, and peer limits from the other kinds", () => {
    const d = { ...cycleDraftOf(cycle()), sharingMode: "MANAGER_SHARES" as const };
    d.kinds.SELF = { ...d.kinds.SELF, enabled: true, formId: "f1" };
    const write = toCycleWrite(d, null);
    expect(write.releaseDate).toBeNull();
    expect(write.kinds.find((k) => k.kind === "SELF")).not.toHaveProperty("peerMax");
  });

  it("names what stops a save", () => {
    const d = newCycleDraft();
    d.kinds.SELF = { ...d.kinds.SELF, opensOn: "2026-11-10", dueOn: "2026-11-01" };
    d.kinds.PEER = { ...d.kinds.PEER, enabled: true, peerMin: 3, peerMax: 2 };
    d.scale = [...d.scale.slice(0, 4), { value: 5, label: " " }];
    expect(draftProblems(d)).toEqual([
      "Give the cycle a name.",
      "A review is due before it opens.",
      "Every point of the rating scale needs a label.",
      "Peers per person: at least one, and the least no more than the most.",
    ]);
  });

  it("writes an upward review as always anonymous, with only its threshold", () => {
    const d = newCycleDraft();
    expect(d.kinds.UPWARD.enabled).toBe(false);
    d.kinds.UPWARD = { ...d.kinds.UPWARD, enabled: true, formId: "f3", dueOn: "2026-11-30", anonymous: false, anonymityThreshold: 4 };
    const upward = toCycleWrite(d, null).kinds.find((k) => k.kind === "UPWARD");
    expect(upward).toEqual({ kind: "UPWARD", formId: "f3", opensOn: null, dueOn: "2026-11-30", anonymous: true, anonymityThreshold: 4 });
    d.kinds.UPWARD = { ...d.kinds.UPWARD, anonymityThreshold: 11 };
    expect(draftProblems(d)).toContain("The anonymity threshold runs from 2 to 10.");
  });

  it("sends the nomination dates only when the person nominates, and checks their order", () => {
    const d = newCycleDraft();
    d.kinds.PEER = { ...d.kinds.PEER, enabled: true, formId: "f2", dueOn: "2026-11-20", nominationDueOn: "2026-11-10", approvalDueOn: "2026-11-12" };
    expect(toCycleWrite(d, null).kinds.find((k) => k.kind === "PEER")).not.toHaveProperty("nominationDueOn");
    d.kinds.PEER = { ...d.kinds.PEER, peerMode: "SUBJECT_NOMINATES" };
    expect(toCycleWrite(d, null).kinds.find((k) => k.kind === "PEER")).toMatchObject({
      peerMode: "SUBJECT_NOMINATES", nominationDueOn: "2026-11-10", approvalDueOn: "2026-11-12",
    });
    expect(draftProblems({ ...d, name: "x" })).toEqual([]);
    d.kinds.PEER = { ...d.kinds.PEER, approvalDueOn: "2026-11-08" };
    expect(draftProblems(d)).toContain("Peers are approved before they are nominated.");
    d.kinds.PEER = { ...d.kinds.PEER, approvalDueOn: "2026-11-25" };
    expect(draftProblems(d)).toContain("The peer review is due before its peers are approved.");
  });

  it("keeps the approver only for a named person, and asks for a manager review to approve", () => {
    const d = { ...newCycleDraft(), approvalMode: "SKIP_LEVEL" as const, approverUserId: "u1" };
    expect(toCycleWrite(d, null)).toMatchObject({ approvalMode: "SKIP_LEVEL", approverUserId: null });
    expect(toCycleWrite({ ...d, approvalMode: "PERSON" }, null)).toMatchObject({ approvalMode: "PERSON", approverUserId: "u1" });
    d.kinds.MANAGER = { ...d.kinds.MANAGER, enabled: false };
    expect(draftProblems(d)).toContain("An approval of the manager review needs a manager review.");
    expect(cycleDraftOf(cycle({ approvalMode: "PERSON", approverUserId: "u2", approverName: "Ann" })))
      .toMatchObject({ approvalMode: "PERSON", approverUserId: "u2", approverName: "Ann" });
  });

  it("treats a draft that saves the same cycle as unchanged", () => {
    const d = cycleDraftOf(cycle());
    expect(sameCycleDraft(d, { ...d, name: "H2 review " })).toBe(true);
    expect(sameCycleDraft(d, { ...d, eligibleHiredBefore: "" })).toBe(false);
  });
});
