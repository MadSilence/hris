import { EVERYONE_AUDIENCE, type TreePage, type TreeSection } from "@/models/hub";
import { partialMock } from "@/test/types";
import { filterTree, movePage, moveSection, nextFreeColor, parseDragId } from "./treeOps";

const page = (id: string): TreePage => partialMock<TreePage>({ id, title: id });
const section = (id: string, pages: string[]): TreeSection =>
  partialMock<TreeSection>({ id, name: id, color: null, audience: EVERYONE_AUDIENCE, pages: pages.map(page) });

const tree = () => [section("policies", ["leave", "travel", "expenses"]), section("offices", ["vilnius"]), section("tools", [])];

describe("the page tree's moves", () => {
  it("reorders a page within its section: the section's ids in their new order", () => {
    const move = movePage(tree(), "expenses", "policies", 0);
    expect(move).toMatchObject({ kind: "reorder", request: { sectionId: "policies", ids: ["expenses", "leave", "travel"] } });
  });

  it("moves a page into another section at the place it was dropped", () => {
    const move = movePage(tree(), "travel", "offices", 0);
    expect(move).toMatchObject({
      kind: "move",
      pageId: "travel",
      request: { sectionId: "offices", position: 0 },
      from: { sectionId: "policies", position: 1 },
    });
    expect(move?.sections.map((s) => s.pages.map((p) => p.id))).toEqual([["leave", "expenses"], ["travel", "vilnius"], []]);
  });

  it("drops a page on a section's own row at its end, an empty section included", () => {
    expect(movePage(tree(), "leave", "tools", null)).toMatchObject({ kind: "move", request: { sectionId: "tools", position: 0 } });
    expect(movePage(tree(), "leave", "offices", null)).toMatchObject({ kind: "move", request: { sectionId: "offices", position: 1 } });
  });

  it("does nothing for a page dropped where it was", () => {
    expect(movePage(tree(), "travel", "policies", 1)).toBeNull();
  });

  it("reorders sections with no section in the request", () => {
    expect(moveSection(tree(), "tools", "policies")?.request).toEqual({ sectionId: null, ids: ["tools", "policies", "offices"] });
    expect(moveSection(tree(), "tools", "tools")).toBeNull();
  });

  it("reads the drag ids it hands out", () => {
    expect(parseDragId("page:abc")).toEqual({ kind: "page", id: "abc" });
    expect(parseDragId("drop:s1")).toEqual({ kind: "drop", id: "s1" });
    expect(parseDragId("other:x")).toBeNull();
  });

  it("gives a new section the next colour nobody uses", () => {
    expect(nextFreeColor(["gray", "berry"], ["gray", "berry", "plum"])).toBe("plum");
    expect(nextFreeColor(["gray"], ["gray"])).toBe("gray");
  });

  it("keeps a section whose name or a page title matches", () => {
    expect(filterTree(tree(), "vil").map((s) => s.id)).toEqual(["offices"]);
    expect(filterTree(tree(), "tools").map((s) => s.id)).toEqual(["tools"]);
  });
});
