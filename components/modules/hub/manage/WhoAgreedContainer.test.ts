import { exportHref } from "./WhoAgreedContainer";

// B5 (the owner, 2026-11-14): the CSV is the table the reader is looking at — its chips and search travel with it.
describe("exportHref", () => {
  it("carries the tab alone when nothing is filtered", () => {
    expect(exportHref("p1", "NOT_YET", { department: null, office: null, q: " " }))
      .toBe("/api/hub/manage/pages/p1/agreements/export?tab=NOT_YET");
  });

  it("carries the department, the office and the search", () => {
    const href = exportHref("p1", "AGREED", { department: "Sales & Ops", office: "Vilnius", q: " ana " });
    const params = new URL(href, "http://x").searchParams;
    expect(params.get("tab")).toBe("AGREED");
    expect(params.get("department")).toBe("Sales & Ops");
    expect(params.get("office")).toBe("Vilnius");
    expect(params.get("q")).toBe("ana");
  });
});
