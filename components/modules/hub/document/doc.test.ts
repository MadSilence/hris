import { isEmptyDoc, isSafeHref, parseDoc, withBlockIds, type DocNode } from "./doc";
import { groupWaiting } from "../reader/ToAgreeContainer";
import { pickCelebrations } from "../reader/CelebrationStrip";
import { isInAppPath } from "@/components/modules/lifecycle/tasks/TaskMaterials";
import type { AgreementRow } from "@/models/hub";
import type { Celebration } from "@/models/home";
import { partialMock } from "@/test/types";

jest.mock("@/components/modules/home/hooks", () => ({ useCelebrations: jest.fn() }));

describe("the hub's document", () => {
  it("gives every top-level block an id, and a fresh one to a repeated id", () => {
    const doc: DocNode = {
      type: "doc",
      content: [
        { type: "paragraph", attrs: { id: "a1" } },
        { type: "paragraph", attrs: { id: "a1" } },
        { type: "heading", attrs: { level: 2 } },
      ],
    };
    const ids = (withBlockIds(doc).content ?? []).map((b) => b.attrs?.id);
    expect(ids[0]).toBe("a1");
    expect(ids[1]).toMatch(/^[A-Za-z0-9]{8}$/);
    expect(ids[1]).not.toBe("a1");
    expect(ids[2]).toMatch(/^[A-Za-z0-9]{8}$/);
  });

  it("leaves a document whose blocks all have ids as it was", () => {
    const doc: DocNode = { type: "doc", content: [{ type: "paragraph", attrs: { id: "x" } }] };
    expect(withBlockIds(doc)).toBe(doc);
  });

  it("allows https, mailto and hub paths only", () => {
    expect(isSafeHref("https://example.com")).toBe(true);
    expect(isSafeHref("mailto:hr@example.com")).toBe(true);
    expect(isSafeHref("/hub/handbook/1")).toBe(true);
    expect(isSafeHref("http://example.com")).toBe(false);
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("/settings")).toBe(false);
  });

  it("reads anything that is not a document as empty", () => {
    expect(isEmptyDoc(parseDoc("not json"))).toBe(true);
    expect(isEmptyDoc(parseDoc('{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hi"}]}]}'))).toBe(false);
  });
});

describe("pages that need the reader's yes", () => {
  const row = (pageId: string, dueOn: string | null, overdue = false) => partialMock<AgreementRow>({ pageId, dueOn, overdue });

  it("puts what is due within a week, and anything overdue, under This week", () => {
    const today = new Date(2026, 10, 12);
    const groups = groupWaiting([row("later", "2026-12-01"), row("soon", "2026-11-15"), row("late", "2026-11-01", true)], today);
    expect(groups.thisWeek.map((r) => r.pageId)).toEqual(["late", "soon"]);
    expect(groups.later.map((r) => r.pageId)).toEqual(["later"]);
  });
});

describe("the celebrations strip", () => {
  const item = (kind: Celebration["kind"], date: string) => partialMock<Celebration>({ kind, date, userId: `${kind}-${date}` });
  const items = [item("BIRTHDAY", "2026-11-12"), item("BIRTHDAY", "2026-11-14"), item("ANNIVERSARY", "2026-11-12"), item("NEW_JOINER", "2026-11-15")];

  it("shows today's birthdays and anniversaries and this week's joiners", () => {
    const picked = pickCelebrations(items, { enabled: true, birthdays: true, anniversaries: true, joiners: true }, "2026-11-12");
    expect([picked.birthdays.length, picked.anniversaries.length, picked.joiners.length]).toEqual([1, 1, 1]);
  });

  it("honours the company's switches", () => {
    expect(pickCelebrations(items, { enabled: false, birthdays: true, anniversaries: true, joiners: true }, "2026-11-12").birthdays).toEqual([]);
    expect(pickCelebrations(items, { enabled: true, birthdays: false, anniversaries: true, joiners: false }, "2026-11-12").joiners).toEqual([]);
  });
});

describe("a task's link material", () => {
  it("opens a path inside the app in place, and nothing that leaves it", () => {
    expect(isInAppPath("/hub/handbook/p1")).toBe(true);
    expect(isInAppPath("//evil.example")).toBe(false);
    expect(isInAppPath("https://example.com")).toBe(false);
  });
});
