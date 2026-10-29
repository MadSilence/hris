import { arrangeHome, moveWidget, setWidgetHidden, toPlacements, widgetsOf, type ArrangeableWidget } from "./homeLayout";

const w = (id: string, group: ArrangeableWidget["group"]): ArrangeableWidget => ({ id, group });

const catalogue = [
  w("waiting", "PERSONAL"),
  w("tasks", "PERSONAL"),
  w("leave", "PERSONAL"),
  w("whos-out", "COMPANY"),
  w("celebrations", "COMPANY"),
  w("clock", "UTILITIES"),
];

const ids = (arranged: ReturnType<typeof arrangeHome>) => arranged.map((entry) => entry.widget.id);

describe("arrangeHome", () => {
  it("is the catalogue's own order for somebody who never arranged anything", () => {
    expect(ids(arrangeHome(catalogue, []))).toEqual(["waiting", "tasks", "leave", "whos-out", "celebrations", "clock"]);
    expect(arrangeHome(catalogue, null).every((entry) => !entry.hidden)).toBe(true);
  });

  it("follows the stored order and keeps hidden widgets hidden", () => {
    const arranged = arrangeHome(catalogue, [
      { id: "leave", hidden: false },
      { id: "tasks", hidden: true },
      { id: "waiting", hidden: false },
    ]);

    expect(ids(widgetsOf(arranged, "PERSONAL"))).toEqual(["leave", "tasks", "waiting"]);
    expect(arranged.find((entry) => entry.widget.id === "tasks")?.hidden).toBe(true);
  });

  it("puts a widget the arrangement does not name in its default place, after its default predecessor", () => {
    const arranged = arrangeHome(catalogue, [
      { id: "waiting", hidden: false },
      { id: "leave", hidden: false },
      { id: "celebrations", hidden: false },
      { id: "whos-out", hidden: false },
    ]);

    expect(ids(widgetsOf(arranged, "PERSONAL"))).toEqual(["waiting", "tasks", "leave"]);
    expect(ids(widgetsOf(arranged, "COMPANY"))).toEqual(["celebrations", "whos-out"]);
    expect(ids(widgetsOf(arranged, "UTILITIES"))).toEqual(["clock"]);
  });

  it("puts a group's first widget, when unnamed, before the ones the reader placed", () => {
    const arranged = arrangeHome(catalogue, [{ id: "leave", hidden: false }, { id: "tasks", hidden: false }]);

    expect(ids(widgetsOf(arranged, "PERSONAL"))).toEqual(["waiting", "leave", "tasks"]);
  });

  it("never offers a widget the reader may not see, whatever was stored", () => {
    const withoutCalendar = catalogue.filter((entry) => entry.id !== "whos-out");

    const arranged = arrangeHome(withoutCalendar, [{ id: "whos-out", hidden: false }, { id: "tasks", hidden: false }]);

    expect(ids(arranged)).not.toContain("whos-out");
  });
});

describe("moveWidget", () => {
  it("moves within the group and stops at its edge", () => {
    const start = arrangeHome(catalogue, []);

    expect(ids(widgetsOf(moveWidget(start, "leave", "up"), "PERSONAL"))).toEqual(["waiting", "leave", "tasks"]);
    // The first of a group does not jump into the group before it, nor the last into the one after.
    expect(ids(moveWidget(start, "whos-out", "up"))).toEqual(ids(start));
    expect(ids(moveWidget(start, "leave", "down"))).toEqual(ids(start));
  });
});

describe("toPlacements", () => {
  it("saves the whole arrangement, and keeps the places of widgets the reader cannot see right now", () => {
    const stored = [{ id: "automations", hidden: true }, { id: "tasks", hidden: false }];
    const arranged = setWidgetHidden(arrangeHome(catalogue, stored), "clock", true);

    const placements = toPlacements(arranged, stored);

    expect(placements).toContainEqual({ id: "clock", hidden: true });
    expect(placements).toContainEqual({ id: "automations", hidden: true });
    expect(placements.map((p) => p.id).slice(0, 6)).toEqual(ids(arranged));
  });
});
