import type { EffectiveAccess, ResourceAccess, ResourceCode } from "@/models/access";
import { canSeeSettingsItem, settingsGroups } from "@/components/modules/settings/config/settings.config";
import { buildSearchPages } from "@/components/modules/search/utils/searchPages";

type Grants = Partial<Record<ResourceCode, ResourceAccess>>;

const reader = (permissions: Grants): EffectiveAccess => ({
  systemOwner: false,
  permissions,
  fields: {},
  moduleSummary: {},
  accessHash: "h",
});

const importItem = settingsGroups.flatMap((group) => group.items).find((item) => item.label === "Import & Export")!;

/** I-B6: whoever may run one of the three import kinds finds the page, and nobody else is offered it. */
describe("the Import & Export entry", () => {
  it.each<[string, Grants]>([
    ["a company-wide profile editor", { "PEOPLE.PROFILE": { EDIT: ["COMPANY"] } }],
    ["a department editor", { "ORG.DEPARTMENT": { EDIT: ["COMPANY"] } }],
    ["a team editor", { "ORG.TEAM": { EDIT: ["COMPANY"] } }],
    ["a time-off policy editor", { "PEOPLE.TIME_OFF_POLICIES": { EDIT: ["COMPANY"] } }],
  ])("is offered to %s", (_who, permissions) => {
    expect(canSeeSettingsItem(reader(permissions), importItem)).toBe(true);
  });

  it.each<[string, Grants]>([
    ["a profile editor over their department only", { "PEOPLE.PROFILE": { EDIT: ["MY_DEPARTMENT"] } }],
    ["a reader of every profile", { "PEOPLE.PROFILE": { VIEW: ["COMPANY"] } }],
    ["a general-settings admin with no import right", { "SETTINGS.GENERAL": { VIEW: ["COMPANY"], EDIT: ["COMPANY"] } }],
  ])("is not offered to %s", (_who, permissions) => {
    expect(canSeeSettingsItem(reader(permissions), importItem)).toBe(false);
  });

  it("is found by quick search exactly when the hub offers it", () => {
    const pages = buildSearchPages([], reader({ "PEOPLE.TIME_OFF_POLICIES": { EDIT: ["COMPANY"] } }));
    expect(pages.map((page) => page.href)).toContain("/settings/general/import");
  });
});
