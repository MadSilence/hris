import type { EffectiveAccess, ResourceCode, ResourceAccess } from "@/models/access";
import { availableWidgets, homeRoleOf, HOME_WIDGETS } from "./catalogue";

jest.mock("./WaitingOnYouWidget", () => ({ WaitingOnYouWidget: () => null }));
jest.mock("./TimeOffWidget", () => ({ TimeOffWidget: () => null }));
jest.mock("./NextTimeOffWidget", () => ({ NextTimeOffWidget: () => null }));
jest.mock("./MyTasksWidget", () => ({ MyTasksWidget: () => null }));
jest.mock("./WhosOutWidget", () => ({ WhosOutWidget: () => null }));
jest.mock("./ThisWeekWidget", () => ({ ThisWeekWidget: () => null }));
jest.mock("./ProcessesWidget", () => ({ ProcessesWidget: () => null }));
jest.mock("./AutomationsWidget", () => ({ AutomationsWidget: () => null }));

const accessWith = (permissions: Partial<Record<ResourceCode, ResourceAccess>>): EffectiveAccess => ({
  systemOwner: false, admin: false,
  permissions,
  fields: {},
  moduleSummary: {},
  accessHash: "h",
});

/** What the seeded Default User holds (`PermissionSeeder`). */
const DEFAULT_USER = accessWith({
  "PEOPLE.PROFILE": { VIEW: ["COMPANY"] },
  "PEOPLE.CALENDAR": { VIEW: ["COMPANY"] },
  "PEOPLE.TIME_OFF": { VIEW: ["SELF"], EDIT: ["SELF"] },
  "PEOPLE.ATTENDANCE": { VIEW: ["SELF"], EDIT: ["SELF"] },
});
const MANAGER = accessWith({
  ...DEFAULT_USER.permissions,
  "PEOPLE.TIME_OFF": { VIEW: ["SELF", "DIRECT_REPORTS"], EDIT: ["SELF"] },
});
const HR = accessWith({
  ...DEFAULT_USER.permissions,
  "PEOPLE.LIFECYCLE_PROCESSES": { VIEW: ["COMPANY"] },
  "SETTINGS.AUTOMATIONS": { VIEW: ["COMPANY"] },
});

const ids = (access: EffectiveAccess | null) => availableWidgets(access).map((widget) => widget.id);

describe("home's catalogue", () => {
  it("offers an ordinary employee their own widgets and the company's — no HR ones, no My time", () => {
    expect(ids(DEFAULT_USER)).toEqual([
      "waiting-on-you", "my-time-off", "next-time-off", "to-sign", "my-tasks", "whos-out", "celebrations",
    ]);
  });

  it("offers HR the processes and the automations", () => {
    expect(ids(HR)).toEqual(expect.arrayContaining(["processes", "automations"]));
  });

  it("keeps the ids home had before the redesign, so a saved arrangement keeps them", () => {
    expect(HOME_WIDGETS.map((w) => w.id)).toEqual(expect.arrayContaining(["waiting-on-you", "my-time-off", "my-tasks", "whos-out", "celebrations"]));
  });

  it("gives every widget a default size it has, and locks only Waiting on you", () => {
    for (const widget of HOME_WIDGETS) expect(widget.sizes).toContain(widget.defaultSize);
    expect(HOME_WIDGETS.filter((w) => w.locked).map((w) => w.id)).toEqual(["waiting-on-you"]);
  });

  it("offers Expiring documents in M only to a person who sees only their own documents (documents-expiry X10)", () => {
    const sizes = (access: EffectiveAccess) => availableWidgets(access).find((w) => w.id === "expiring-documents")?.sizes;
    const own = accessWith({ ...DEFAULT_USER.permissions, "PEOPLE.DOCUMENTS": { VIEW: ["SELF"] } });
    const reports = accessWith({ ...DEFAULT_USER.permissions, "PEOPLE.DOCUMENTS": { VIEW: ["SELF", "DIRECT_REPORTS"] } });
    const company = accessWith({ ...DEFAULT_USER.permissions, "PEOPLE.DOCUMENTS": { VIEW: ["COMPANY"] } });
    expect(sizes(own)).toEqual(["M"]);
    expect(sizes(reports)).toEqual(["S", "M", "L"]);
    expect(sizes(company)).toEqual(["S", "M", "L"]);
    expect(sizes({ ...own, systemOwner: true })).toEqual(["S", "M", "L"]);
    expect(sizes(DEFAULT_USER)).toBeUndefined();
  });

  it("reads the role a default home is for — not from the profile right everyone holds", () => {
    expect(homeRoleOf(DEFAULT_USER)).toBe("EMPLOYEE");
    expect(homeRoleOf(MANAGER)).toBe("MANAGER");
    expect(homeRoleOf(HR)).toBe("HR");
    expect(homeRoleOf(null)).toBe("EMPLOYEE");
  });
});
