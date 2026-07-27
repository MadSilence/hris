import { canAccess } from "./canAccess";
import { EffectiveAccess } from "./EffectiveAccess";

function makeAccess(
  permissions: EffectiveAccess["permissions"],
  accessHash = "hash-abc",
): EffectiveAccess {
  return { systemOwner: false, permissions, fields: {}, moduleSummary: {}, accessHash };
}

describe("canAccess", () => {
  it("denies when access is null/undefined", () => {
    expect(canAccess({ access: null, resource: "ROLES.ROLE", action: "VIEW" })).toBe(false);
    expect(canAccess({ access: undefined, resource: "ROLES.ROLE", action: "VIEW" })).toBe(false);
  });

  it("grants everything for a system owner flagged by systemOwner, despite empty maps", () => {
    const owner: EffectiveAccess = {
      systemOwner: true,
      permissions: {},
      fields: {},
      moduleSummary: {},
      accessHash: "any-hash",
    };
    expect(canAccess({ access: owner, resource: "ROLES.ROLE", action: "MANAGE" })).toBe(true);
    expect(canAccess({ access: owner, resource: "PEOPLE.PROFILE", action: "VIEW", scope: "SELF" })).toBe(true);
  });

  it("still recognises the legacy system-owner accessHash", () => {
    const owner = makeAccess({}, "system-owner");
    expect(canAccess({ access: owner, resource: "ROLES.ROLE", action: "MANAGE" })).toBe(true);
  });

  it("denies a resource that is not in the permissions map (non-owner, empty map)", () => {
    const access = makeAccess({});
    expect(canAccess({ access, resource: "ROLES.ROLE", action: "VIEW" })).toBe(false);
  });

  // Actions are matched literally, exactly like EffectiveAccess#can on the backend.
  it("does not let MANAGE satisfy EDIT or VIEW", () => {
    const access = makeAccess({ "ORG.DEPARTMENT": { MANAGE: ["COMPANY"] } });
    expect(canAccess({ access, resource: "ORG.DEPARTMENT", action: "MANAGE" })).toBe(true);
    expect(canAccess({ access, resource: "ORG.DEPARTMENT", action: "EDIT" })).toBe(false);
    expect(canAccess({ access, resource: "ORG.DEPARTMENT", action: "VIEW" })).toBe(false);
  });

  it("does not let a lower action satisfy a higher one", () => {
    const access = makeAccess({ "ORG.DEPARTMENT": { VIEW: ["COMPANY"] } });
    expect(canAccess({ access, resource: "ORG.DEPARTMENT", action: "VIEW" })).toBe(true);
    expect(canAccess({ access, resource: "ORG.DEPARTMENT", action: "EDIT" })).toBe(false);
    expect(canAccess({ access, resource: "ORG.DEPARTMENT", action: "MANAGE" })).toBe(false);
  });

  it("grants each action that is listed explicitly", () => {
    const access = makeAccess({
      "ORG.DEPARTMENT": { VIEW: ["COMPANY"], EDIT: ["COMPANY"], MANAGE: ["COMPANY"] },
    });
    expect(canAccess({ access, resource: "ORG.DEPARTMENT", action: "VIEW" })).toBe(true);
    expect(canAccess({ access, resource: "ORG.DEPARTMENT", action: "EDIT" })).toBe(true);
    expect(canAccess({ access, resource: "ORG.DEPARTMENT", action: "MANAGE" })).toBe(true);
  });

  it("denies an action granted with an empty scope list", () => {
    const access = makeAccess({ "ORG.DEPARTMENT": { VIEW: [] } });
    expect(canAccess({ access, resource: "ORG.DEPARTMENT", action: "VIEW" })).toBe(false);
  });

  it("with no requested scope, any granted scope is enough", () => {
    const access = makeAccess({ "PEOPLE.PROFILE": { VIEW: ["SELF"] } });
    expect(canAccess({ access, resource: "PEOPLE.PROFILE", action: "VIEW" })).toBe(true);
  });

  it("matches the requested scope exactly", () => {
    const access = makeAccess({ "PEOPLE.PROFILE": { VIEW: ["DIRECT_REPORTS"] } });
    expect(canAccess({ access, resource: "PEOPLE.PROFILE", action: "VIEW", scope: "DIRECT_REPORTS" })).toBe(true);
    expect(canAccess({ access, resource: "PEOPLE.PROFILE", action: "VIEW", scope: "SELF" })).toBe(false);
  });

  it("COMPANY grant satisfies any narrower requested scope", () => {
    const access = makeAccess({ "PEOPLE.PROFILE": { VIEW: ["COMPANY"] } });
    expect(canAccess({ access, resource: "PEOPLE.PROFILE", action: "VIEW", scope: "SELF" })).toBe(true);
    expect(canAccess({ access, resource: "PEOPLE.PROFILE", action: "VIEW", scope: "DIRECT_REPORTS" })).toBe(true);
    expect(canAccess({ access, resource: "PEOPLE.PROFILE", action: "VIEW", scope: "COMPANY" })).toBe(true);
  });

  it("SELF grant does not satisfy a COMPANY request", () => {
    const access = makeAccess({ "PEOPLE.PROFILE": { VIEW: ["SELF"] } });
    expect(canAccess({ access, resource: "PEOPLE.PROFILE", action: "VIEW", scope: "COMPANY" })).toBe(false);
  });
});
