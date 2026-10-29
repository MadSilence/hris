import type { EffectiveAccess, ResourceCode, ResourceAccess } from "@/models/access";
import { availableWidgets, HOME_WIDGETS } from "./catalogue";

jest.mock("./WaitingOnYouWidget", () => ({ WaitingOnYouWidget: () => null }));
jest.mock("./MyTasksWidget", () => ({ MyTasksWidget: () => null }));
jest.mock("./MyLeaveWidget", () => ({ MyLeaveWidget: () => null }));
jest.mock("./WhosOutWidget", () => ({ WhosOutWidget: () => null }));
jest.mock("./CelebrationsWidget", () => ({ CelebrationsWidget: () => null }));
jest.mock("./UpcomingHolidaysWidget", () => ({ UpcomingHolidaysWidget: () => null }));
jest.mock("./ProcessesWidget", () => ({ ProcessesWidget: () => null }));
jest.mock("./AutomationsWidget", () => ({ AutomationsWidget: () => null }));
jest.mock("./QuickActionsWidget", () => ({ QuickActionsWidget: () => null }));
jest.mock("./ClockWidget", () => ({ ClockWidget: () => null }));

const accessWith = (permissions: Partial<Record<ResourceCode, ResourceAccess>>): EffectiveAccess => ({
  systemOwner: false,
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

const ids = (access: EffectiveAccess | null) => availableWidgets(access).map((widget) => widget.id);

describe("home's catalogue", () => {
  it("offers an ordinary employee the personal, company and utility widgets — and no HR ones", () => {
    expect(ids(DEFAULT_USER)).toEqual([
      "waiting-on-you", "my-tasks", "my-time-off", "whos-out", "celebrations", "upcoming-holidays",
      "quick-actions", "company-time",
    ]);
  });

  it("offers the HR group only with the rights its reads check", () => {
    expect(ids(accessWith({ "PEOPLE.LIFECYCLE_PROCESSES": { VIEW: ["MY_TEAM"] } }))).toContain("processes");
    expect(ids(accessWith({ "SETTINGS.AUTOMATIONS": { VIEW: ["COMPANY"] } }))).toContain("automations");
    expect(ids(DEFAULT_USER)).not.toContain("automations");
  });

  it("withholds every gated widget from somebody with no grants at all", () => {
    expect(ids(accessWith({}))).toEqual(["my-tasks", "upcoming-holidays", "company-time"]);
    expect(ids(null)).toEqual(["my-tasks", "upcoming-holidays", "company-time"]);
  });

  it("offers Quick Actions when either action is possible, and not otherwise", () => {
    expect(ids(accessWith({ "PEOPLE.ATTENDANCE": { EDIT: ["SELF"] } }))).toContain("quick-actions");
    expect(ids(accessWith({ "PEOPLE.TIME_OFF": { VIEW: ["SELF"] } }))).not.toContain("quick-actions");
  });

  it("offers a system owner everything", () => {
    expect(ids({ ...accessWith({}), systemOwner: true })).toEqual(HOME_WIDGETS.map((widget) => widget.id));
  });

  it("has unique ids that the server will keep (lower case, digits, dashes)", () => {
    const all = HOME_WIDGETS.map((widget) => widget.id);
    expect(new Set(all).size).toBe(all.length);
    all.forEach((id) => expect(id).toMatch(/^[a-z][a-z0-9-]{0,47}$/));
  });
});
